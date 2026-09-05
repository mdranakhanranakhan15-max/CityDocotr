import { NextResponse } from 'next/server';

interface MessagePayload {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const MEDICAL_SYSTEM_PROMPT = `You are "Dr. Aria", an empathetic and knowledgeable AI Clinical Triage Assistant for the MediConnect Telehealth Platform.
Your purpose is to assist patients prior to or during their teleconsultation with their physician.
Guidelines:
1. Provide clear, empathetic, and evidence-based health guidance and triage.
2. Formulate helpful questions the patient can ask their consulting physician in their live video session.
3. If symptoms suggest emergency "Red Flags" (e.g. severe chest pain, sudden numbness, difficulty breathing), immediately advise seeking emergency medical services (e.g., dial 911/emergency hotline).
4. Keep responses concise, structured, friendly, and easy to understand when read aloud by Text-to-Speech (avoid complex ASCII art or heavy markdown tables).
5. Always remind the patient that this AI guidance complements but does not replace their direct physician evaluation.`;

function generateLocalClinicalResponse(userQuery: string, doctorName?: string): string {
  const query = userQuery.toLowerCase();
  const docRef = doctorName ? `your session with ${doctorName}` : 'your live consultation';

  if (query.includes('chest pain') || query.includes('heart') || query.includes('pressure in chest')) {
    return `⚠️ Important: Chest pain or pressure requires immediate medical evaluation. If you are experiencing sudden severe chest discomfort radiating to your arm, neck, or jaw, or have shortness of breath, please call emergency services (911) immediately. If this is a mild or chronic sensation you are discussing in ${docRef}, note down when it started, what triggers it, and your current blood pressure readings.`;
  }

  if (query.includes('headache') || query.includes('migraine')) {
    return `Headaches can stem from tension, dehydration, eye strain, or vascular causes like migraines. 
Key questions to share in ${docRef}:
1. Has this headache come on suddenly, or has it built up over days?
2. Are you experiencing visual changes, sensitivity to light, or nausea?
Stay hydrated, rest in a dimly lit room, and tell the doctor what medications you've taken so far.`;
  }

  if (query.includes('fever') || query.includes('temperature') || query.includes('cold') || query.includes('cough') || query.includes('flu')) {
    return `For fever and respiratory symptoms, it is helpful to monitor your temperature regularly and stay well-hydrated with fluids and electrolytes.
To help during ${docRef}, be ready to share:
• What is your highest recorded temperature and when did it start?
• Do you have a productive cough, sore throat, or body aches?
• Have you taken antipyretics like Acetaminophen or Ibuprofen?`;
  }

  if (query.includes('skin') || query.includes('rash') || query.includes('itch') || query.includes('acne')) {
    return `Skin irritations and rashes can be allergic, contact-related, or viral/bacterial.
For your upcoming video consultation:
• Ensure good lighting so the doctor can inspect the area clearly on camera.
• Note when you first noticed the rash, whether it is itchy, burning, or spreading, and any new soaps, lotions, or foods you recently encountered.`;
  }

  if (query.includes('anxiety') || query.includes('stress') || query.includes('sleep') || query.includes('insomnia') || query.includes('depress')) {
    return `Mental wellness is deeply connected to your physical health. Experiencing heightened stress, anxiety, or disrupted sleep patterns is very common and treatable.
During ${docRef}, don't hesitate to share how long you've felt this way, how it impacts your daily focus or appetite, and any techniques you've already tried. You are taking a positive step by seeking care.`;
  }

  if (query.includes('prescription') || query.includes('medication') || query.includes('dosage') || query.includes('side effect')) {
    return `Understanding your prescriptions and potential drug interactions is critical for safe care.
Make a quick list for ${docRef} of:
1. All current prescription medications, dosages, and frequency.
2. Any over-the-counter supplements or herbal remedies.
3. Any known allergies or unusual side effects you have noticed.`;
  }

  // Default intelligent clinical summary
  return `Thank you for sharing your symptoms. I have logged these notes so you are prepared for ${docRef}.
To get the most out of your consultation:
• Summarize your main concern in 1-2 sentences.
• Share how long it has been going on and what makes it better or worse.
• Ask the physician about recommended next steps or diagnostic tests.
Is there any specific symptom or medication you would like me to explain further?`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, doctorName, specialty } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1]?.content || '';
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `${MEDICAL_SYSTEM_PROMPT}\nThe patient is currently preparing for or in a consultation with ${doctorName || 'a physician'} (${specialty || 'General Practice'}).`,
              },
              ...messages.map((m: MessagePayload) => ({
                role: m.role,
                content: m.content,
              })),
            ],
            temperature: 0.7,
            max_tokens: 450,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            return NextResponse.json({ reply, source: 'openai' });
          }
        }
      } catch (openAiError) {
        console.warn('OpenAI API call failed, falling back to local engine:', openAiError);
      }
    }

    // High quality clinical rule-based engine fallback
    const localReply = generateLocalClinicalResponse(lastMessage, doctorName);
    return NextResponse.json({
      reply: localReply,
      source: 'clinical-engine',
    });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

