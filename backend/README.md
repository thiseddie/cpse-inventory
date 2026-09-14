# CPSE-MATCH Full Backend
## Mac
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
docker compose up -d
cp .env.example .env
uvicorn app.main:app --reload
Open http://127.0.0.1:8000/docs

Upload your `CPSE_MATCH_SIH_Demo_Dataset.xlsx` using POST `/api/materials/upload?cpse_code=BHEL`.
The backend automatically selects the `Material_Master` sheet.

Then run POST `/api/harmonization/run`.

Dashboard: GET `/api/dashboard/stats`
Review queue: GET `/api/mappings?status=pending`
Approve: PATCH `/api/mappings/{id}/review` with `{"status":"approved","reviewer":"SIH Reviewer"}`

The material/price values in the SIH demo workbook are synthetic demonstration data.
