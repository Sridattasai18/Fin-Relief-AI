"""
Integration tests for the settlement API endpoints.

Covers:
  POST /settlement/{loan_id}
  GET  /snapshots
  GET  /snapshots/{loan_id}

Uses an isolated SQLite test database via conftest.py fixtures.
"""


# ---------------------------------------------------------------------------
# POST /settlement/{loan_id}
# ---------------------------------------------------------------------------

class TestSettlementCalculate:

    def test_requires_auth(self, client, test_loan):
        """Unauthenticated request must return 401."""
        resp = client.post(f"/settlement/{test_loan}")
        assert resp.status_code == 401

    def test_nonexistent_loan_returns_404(self, client, auth_headers):
        """Loan ID that doesn't exist → 404, not a crash."""
        resp = client.post("/settlement/99999", headers=auth_headers)
        assert resp.status_code == 404
        assert "detail" in resp.json()

    def test_other_users_loan_returns_404(self, client):
        """
        User A cannot access User B's loan — should get 404 (ownership check),
        not 403, which would leak that the loan exists.
        """
        # Register User A
        r = client.post("/auth/register", json={
            "name": "User A", "email": "usera@example.com", "password": "PassA1234!"
        })
        assert r.status_code == 201
        headers_a = {"Authorization": f"Bearer {r.json()['access_token']}"}

        # User A creates a loan
        loan_resp = client.post("/loans", json={
            "lender": "Bank A", "amount": 100000, "emi": 5000,
            "overdue_days": 0, "income": 50000,
        }, headers=headers_a)
        assert loan_resp.status_code == 201
        loan_id = loan_resp.json()["id"]

        # Register User B
        r2 = client.post("/auth/register", json={
            "name": "User B", "email": "userb@example.com", "password": "PassB1234!"
        })
        assert r2.status_code == 201
        headers_b = {"Authorization": f"Bearer {r2.json()['access_token']}"}

        # User B tries to compute settlement on User A's loan
        resp = client.post(f"/settlement/{loan_id}", headers=headers_b)
        assert resp.status_code == 404

    def test_returns_correct_shape(self, client, auth_headers, test_loan):
        """Response must include all required keys with correct types."""
        resp = client.post(f"/settlement/{test_loan}", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        expected_keys = {
            "loan_id", "lender", "dti_ratio", "stress_score", "stress_level",
            "settlement_percentage", "settlement_amount", "outstanding_amount",
            "monthly_surplus", "months_to_clear_debt", "is_estimated",
        }
        assert expected_keys.issubset(data.keys())
        assert data["is_estimated"] is True
        assert isinstance(data["dti_ratio"], float)
        assert isinstance(data["stress_score"], float)
        assert isinstance(data["settlement_amount"], float)
        assert isinstance(data["months_to_clear_debt"], int)

    def test_math_matches_hand_calculation(self, client, auth_headers, test_loan):
        """
        test_loan = income=75000, emi=25000, overdue=90, amount=500000, expenses=None
        Hand-verified values (also confirmed in test_calculations.py):
          dti_ratio            = 33.3
          monthly_surplus      = 20000.0
          stress_score         = 36.7
          stress_level         = Medium
          settlement_percentage= 37.8
          settlement_amount    = 189000.0  (500000 × 37.8% — consistent with displayed pct)
          outstanding_amount   = 500000.0
          months_to_clear_debt = 20
        """
        resp = client.post(f"/settlement/{test_loan}", headers=auth_headers)
        assert resp.status_code == 200
        d = resp.json()
        assert d["dti_ratio"] == 33.3
        assert d["monthly_surplus"] == 20000.0
        assert d["stress_score"] == 36.7
        assert d["stress_level"] == "Medium"
        assert d["settlement_percentage"] == 37.8
        assert d["settlement_amount"] == 189000.0  # 500000 * 37.8% = 189000
        assert d["outstanding_amount"] == 500000.0
        assert d["months_to_clear_debt"] == 20

    def test_settlement_creates_snapshot(self, client, auth_headers, test_loan):
        """Calling POST /settlement should auto-persist a snapshot."""
        client.post(f"/settlement/{test_loan}", headers=auth_headers)
        snaps = client.get(f"/snapshots/{test_loan}", headers=auth_headers).json()
        assert len(snaps) >= 1
        assert snaps[0]["loan_id"] == test_loan

    def test_settlement_deduplication(self, client, auth_headers, test_loan):
        """
        Calling POST /settlement twice within 5 minutes should only create
        one snapshot (5-minute deduplication window).
        """
        client.post(f"/settlement/{test_loan}", headers=auth_headers)
        client.post(f"/settlement/{test_loan}", headers=auth_headers)
        snaps = client.get(f"/snapshots/{test_loan}", headers=auth_headers).json()
        assert len(snaps) == 1


# ---------------------------------------------------------------------------
# GET /snapshots
# ---------------------------------------------------------------------------

class TestSnapshotsList:

    def test_requires_auth(self, client):
        """GET /snapshots without token → 401."""
        resp = client.get("/snapshots")
        assert resp.status_code == 401

    def test_empty_initially(self, client, auth_headers):
        """No settlements done yet → empty list, not an error."""
        resp = client.get("/snapshots", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json() == []

    def test_populated_after_settlement(self, client, auth_headers, test_loan):
        """After a settlement call, GET /snapshots returns at least one record."""
        client.post(f"/settlement/{test_loan}", headers=auth_headers)
        resp = client.get("/snapshots", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1
        assert data[0]["loan_id"] == test_loan

    def test_snapshot_shape(self, client, auth_headers, test_loan):
        """Each snapshot must have the required fields."""
        client.post(f"/settlement/{test_loan}", headers=auth_headers)
        snaps = client.get("/snapshots", headers=auth_headers).json()
        s = snaps[0]
        for key in ("id", "loan_id", "lender", "dti_ratio", "stress_score",
                    "stress_level", "settlement_percentage", "monthly_surplus",
                    "months_to_clear_debt", "created_at"):
            assert key in s, f"Missing key: {key}"

    def test_only_own_snapshots_returned(self, client):
        """User B's snapshots should not appear in User A's results."""
        # Register and create loan for User A
        ra = client.post("/auth/register", json={
            "name": "A", "email": "a@test.com", "password": "PassA1234!"
        })
        ha = {"Authorization": f"Bearer {ra.json()['access_token']}"}
        la = client.post("/loans", json={
            "lender": "BankA", "amount": 100000, "emi": 5000,
            "overdue_days": 0, "income": 50000,
        }, headers=ha).json()["id"]
        client.post(f"/settlement/{la}", headers=ha)

        # Register User B (no loans/settlements)
        rb = client.post("/auth/register", json={
            "name": "B", "email": "b@test.com", "password": "PassB1234!"
        })
        hb = {"Authorization": f"Bearer {rb.json()['access_token']}"}

        resp = client.get("/snapshots", headers=hb)
        assert resp.json() == []


# ---------------------------------------------------------------------------
# GET /snapshots/{loan_id}
# ---------------------------------------------------------------------------

class TestSnapshotsByLoan:

    def test_requires_auth(self, client, test_loan):
        """GET /snapshots/{loan_id} without token → 401."""
        resp = client.get(f"/snapshots/{test_loan}")
        assert resp.status_code == 401

    def test_missing_loan_returns_404(self, client, auth_headers):
        """Non-existent loan_id → 404."""
        resp = client.get("/snapshots/99999", headers=auth_headers)
        assert resp.status_code == 404

    def test_returns_snapshots_for_correct_loan(self, client, auth_headers, test_loan):
        """After settlement, snapshots/{loan_id} returns records for that loan."""
        client.post(f"/settlement/{test_loan}", headers=auth_headers)
        resp = client.get(f"/snapshots/{test_loan}", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1
        assert all(s["loan_id"] == test_loan for s in data)


# ---------------------------------------------------------------------------
# Regression: Settlement/Letter amount consistency
# Bug: letters.py was recomputing settlement_percentage independently instead
# of reading the saved StressSnapshot, causing floating-point divergence
# between the Settlement page amount and the letter's embedded amount.
# Fix: letter generation reads settlement_percentage from the saved snapshot.
# ---------------------------------------------------------------------------

class TestLetterSettlementConsistency:
    """
    Regression tests for the settlement/letter data-consistency fix.

    Covers the exact ICICI Bank scenario from the bug report:
      outstanding=350000, emi=18000, overdue=74, income=30000, expenses=None
    Both the settlement snapshot and the generated letter must embed
    identical settlement amounts — to the rupee.
    """

    def _create_icici_loan(self, client, auth_headers):
        """Create the exact loan from the bug report."""
        resp = client.post("/loans", json={
            "lender": "ICICI Bank",
            "loan_type": "Personal loan",
            "amount": 350000,
            "emi": 18000,
            "overdue_days": 74,
            "income": 30000,
        }, headers=auth_headers)
        assert resp.status_code == 201
        return resp.json()["id"]

    def test_letter_requires_prior_settlement_analysis(self, client, auth_headers):
        """
        Generating a letter without first running settlement must return 400
        with a clear message — not silently recompute with potentially
        different values.
        """
        loan_id = self._create_icici_loan(client, auth_headers)
        resp = client.post(f"/letters/{loan_id}", headers=auth_headers)
        assert resp.status_code == 400
        assert "settlement analysis" in resp.json()["detail"].lower()

    def test_settlement_amount_matches_letter_amount_exactly(self, client, auth_headers):
        """
        The settlement_amount shown on the Settlement page must equal the
        amount embedded in the generated letter — to the rupee.

        ICICI scenario: amount=350000, emi=18000, overdue=74, income=30000
          dti = 18000/30000 * 100 = 60.0
          expenses = 30000 * 0.4 = 12000
          surplus = 30000 - 18000 - 12000 = 0
          stress = 60*0.5 + (74/180)*40 + 0 = 30 + 16.444... = 46.444... → 46.4
          settle_pct = 25 + 46.444...*0.35 = 41.255... → 41.3 (rounded to 1dp)
          settlement_amount = round(350000 * 41.3 / 100, 2) = 144550.0
        """
        loan_id = self._create_icici_loan(client, auth_headers)

        # Step 1: run and save settlement analysis
        settle_resp = client.post(f"/settlement/{loan_id}", headers=auth_headers)
        assert settle_resp.status_code == 200
        settlement_data = settle_resp.json()
        displayed_pct = settlement_data["settlement_percentage"]        # e.g. 41.3
        displayed_amount = settlement_data["settlement_amount"]         # e.g. 144550.0

        # Step 2: generate letter — must read the saved snapshot's pct
        letter_resp = client.post(f"/letters/{loan_id}", headers=auth_headers)
        assert letter_resp.status_code == 201
        letter_data = letter_resp.json()

        # The letter's stored settlement_pct must match the snapshot's exactly
        assert letter_data["settlement_pct"] == displayed_pct, (
            f"Letter settlement_pct {letter_data['settlement_pct']} != "
            f"Settlement page pct {displayed_pct}"
        )

        # The amount embedded in the letter text must match to the rupee
        # settlement_amount = round(350000 * displayed_pct / 100, 2)
        expected_amount = round(350000 * displayed_pct / 100, 2)
        assert expected_amount == displayed_amount, (
            f"Settlement amount from pct ({expected_amount}) != "
            f"displayed_amount ({displayed_amount})"
        )

        # Verify the amount actually appears in the letter text
        # Format: "Rs. X,XX,XXX" (Indian number formatting with commas)
        amount_int = int(expected_amount)
        amount_str = f"{amount_int:,}"
        assert amount_str in letter_data["letter_text"], (
            f"Expected Rs. {amount_str} in letter text but not found.\n"
            f"Letter pct={letter_data['settlement_pct']}, "
            f"Settlement pct={displayed_pct}"
        )

    def test_second_letter_still_uses_snapshot(self, client, auth_headers):
        """
        Generating a second letter (re-generate) must still read the saved
        snapshot, not recompute. Both letters for the same loan must have
        identical settlement_pct values.
        """
        loan_id = self._create_icici_loan(client, auth_headers)

        # Save settlement analysis
        client.post(f"/settlement/{loan_id}", headers=auth_headers)

        # Generate two letters
        letter1 = client.post(f"/letters/{loan_id}", headers=auth_headers).json()
        letter2 = client.post(f"/letters/{loan_id}", headers=auth_headers).json()

        assert letter1["settlement_pct"] == letter2["settlement_pct"], (
            "Two letters for the same loan must have identical settlement_pct"
        )
        assert letter2["version"] == letter1["version"] + 1, "Version should increment"
