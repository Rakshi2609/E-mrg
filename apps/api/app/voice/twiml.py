from xml.sax.saxutils import escape


def greeting_twiml(message: str = "Emergency assistant connected. Please tell me what happened.") -> str:
    return f"<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response><Say>{escape(message)}</Say><Gather input=\"speech\" action=\"/api/v1/twilio/voice\" method=\"POST\" /></Response>"
