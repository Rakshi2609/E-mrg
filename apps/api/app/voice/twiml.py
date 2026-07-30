from xml.sax.saxutils import escape


def greeting_twiml(message: str = "Emergency assistant connected. Please tell me what happened.") -> str:
    return response_with_gather(message)


def response_with_gather(message: str) -> str:
    safe_message = escape(message)
    return f"<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response><Say>{safe_message}</Say><Gather input=\"speech\" action=\"/api/v1/twilio/voice\" method=\"POST\" speechTimeout=\"auto\" /></Response>"


def handoff_twiml(message: str = "I have recorded the information. A dispatcher will review it now. If anyone is in immediate danger, contact local emergency services.") -> str:
    safe_message = escape(message)
    return f"<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response><Say>{safe_message}</Say><Hangup/></Response>"
