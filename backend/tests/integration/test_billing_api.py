"""Billing API integration tests."""

from datetime import date

import pytest
from httpx import AsyncClient

from tests.factories import InvoiceItemPayloadFactory
from tests.helpers import create_clinical_chain

pytestmark = pytest.mark.integration


async def test_list_invoices(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    response = await client.get("/api/v1/billing/invoices", headers=admin_headers)
    assert response.status_code == 200


async def test_create_invoice(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    chain = await create_clinical_chain(client, admin_headers)
    payload = {
        "consultation_id": chain["consultation"]["id"],
        "invoice_date": date.today().isoformat(),
        "notes": "Consultation billing",
        "items": [InvoiceItemPayloadFactory()],
        "discount_amount": "0.00",
        "tax_amount": "0.00",
    }
    response = await client.post("/api/v1/billing/invoices", json=payload, headers=admin_headers)
    assert response.status_code == 201, response.text
    assert response.json()["consultation_id"] == chain["consultation"]["id"]
