import re


def format_medical_notes(transcript: str):

    notes = {
        "chiefComplaint": "",
        "history": "",
        "diagnosis": "",
        "prescription": "",
        "advice": ""
    }

    text = transcript.lower()

    # Fever
    if "fever" in text:
        notes["chiefComplaint"] = "Fever"
        notes["diagnosis"] = "Probable Viral Fever"

    # Cough
    if "cough" in text:
        if notes["chiefComplaint"]:
            notes["chiefComplaint"] += ", Cough"
        else:
            notes["chiefComplaint"] = "Cough"

    # Headache
    if "headache" in text:
        if notes["chiefComplaint"]:
            notes["chiefComplaint"] += ", Headache"

    # Prescription
    if "paracetamol" in text:
        notes["prescription"] = "Paracetamol 650 mg"

    # Advice
    notes["advice"] = "Drink plenty of fluids.\nTake adequate rest."

    notes["history"] = transcript

    return notes