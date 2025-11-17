from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

# Load model and helpers
model = joblib.load("best_credit_model.pkl")
label_encoders = joblib.load("encoders.pkl")
scaler = joblib.load("scaler.pkl")

app = FastAPI()

class CreditInput(BaseModel):
    age: int
    income: float
    home_ownership: str
    emp_length: int
    loan_intent: str
    loan_grade: str
    loan_amnt: float
    loan_int_rate: float
    default_on_file: str
    cred_hist_length: int


@app.post("/predict")
def predict_credit_risk(data: CreditInput):

    # Derived field
    loan_percent_income = data.loan_amnt / data.income if data.income > 0 else 0

    # Encode categories
    input_data = {
        "person_age": data.age,
        "person_income": data.income,
        "person_home_ownership": label_encoders["person_home_ownership"].transform([data.home_ownership])[0],
        "person_emp_length": data.emp_length,
        "loan_intent": label_encoders["loan_intent"].transform([data.loan_intent])[0],
        "loan_grade": label_encoders["loan_grade"].transform([data.loan_grade])[0],
        "loan_amnt": data.loan_amnt,
        "loan_int_rate": data.loan_int_rate,
        "loan_percent_income": loan_percent_income,
        "cb_person_default_on_file": label_encoders["cb_person_default_on_file"].transform([data.default_on_file])[0],
        "cb_person_cred_hist_length": data.cred_hist_length,
    }

    input_df = pd.DataFrame([input_data])
    scaled = scaler.transform(input_df)
    proba = model.predict_proba(scaled)[0][1]

    return {
        "risk_score": float(proba),
        "risk_level": (
            "high" if proba > 0.7 else
            "moderate" if proba > 0.5 else
            "low"
        )
    }
