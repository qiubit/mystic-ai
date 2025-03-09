import { togetherai } from "@ai-sdk/togetherai";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const TOGETHER_AI_API_KEY = process.env.TOGETHER_AI_API_KEY;
    const body = await req.json();
    const { reading, locale } = body;

    if (!TOGETHER_AI_API_KEY) {
      return Response.json(
        { error: "API key not configured on server" },
        { status: 500 }
      );
    }

    const systemPromptEn = `You are tarot reading summariser. Your task is to summarise the reading of the all card drawn; and finish up with total reading summary, using in 1-3 sentences per card and total reading summary. Each summary should be in separate paragraph, there should be 4 paragraphs total. For cards, the first line of paragraph should contain emoji and title and second; the reading. For total summary, it should be surrounded by emojis from both sides. Use JSON format for output.

Example Input:
In the realm of the past, The Moon suggests that your previous experiences in love have been shrouded in illusion, fear, and anxiety. Your subconscious may have been clouded by doubts and uncertainties, leading to a sense of disconnection from your true desires. This card indicates that you may have been navigating through the darkness, unsure of the path ahead.

As we transition to the present, Justice reveals that the universe is currently balancing the scales of truth and fairness in your love life. This card signifies that you are being called to confront the realities of your past experiences and acknowledge the cause and effect of your actions. It is a time for self-reflection, honesty, and accountability, allowing you to clarify your intentions and prepare for the future.

Now, as we gaze into the future, The Tower bursts forth with a revelation that will shake the foundations of your love life. This card foretells a sudden and profound change, one that may seem catastrophic at first, but ultimately leads to a liberation from the old and a rebirth into the new. Expect a dramatic upheaval that will clear the way for a more authentic and profound connection with yourself and others. The Tower suggests that you are on the cusp of a revolutionary transformation, one that will awaken you to the true nature of love and relationships.


Example Output:
{
  "cards": [
    {
      "title": "🔮 Past – The Moon",
      "content": "Your love life has been clouded by illusion and uncertainty. Doubts and fears may have kept you from seeing the truth."
    },
    {
      "title": "⚖️ Present – Justice",
      "content": "The universe is restoring balance. It's time for honesty, reflection, and taking responsibility for your choices in love."
    },
    {
      "title": "🔥 Future – The Tower",
      "content": "A sudden shake-up is coming! Though it may feel chaotic, this transformation will clear the way for deeper, more authentic connections."
    }
  ],
  "summary": "🌿 Trust the process. Embrace the truth. Love is evolving. 💫✨"
}
 `;

 const systemPromptPl = `Jesteś podsumowującym interpretacje tarota. Twoim zadaniem jest streszczenie odczytu wszystkich wylosowanych kart oraz podsumowanie całego odczytu, używając 1-3 zdań na kartę i podsumowanie całości. Każde streszczenie powinno być w osobnym akapicie, łącznie powinny być 4 akapity. Dla kart, pierwsza linia akapitu powinna zawierać emoji i tytuł, a druga; interpretację. Dla całkowitego podsumowania, powinno być otoczone emoji z obu stron. Użyj formatu JSON do wyników.

Przykładowy input:
W sferze przeszłości, Księżyc sugeruje, że Twoje poprzednie doświadczenia miłosne były spowite iluzją, strachem i niepokojem. Twoja podświadomość mogła być zaćmiona wątpliwościami i niepewnościami, prowadząc do poczucia odłączenia od Twoich prawdziwych pragnień. Ta karta wskazuje, że mogłeś/aś poruszać się w ciemności, niepewny/a drogi przed sobą.

Przechodząc do teraźniejszości, Sprawiedliwość ujawnia, że wszechświat obecnie przywraca równowagę prawdy i uczciwości w Twoim życiu miłosnym. Ta karta oznacza, że jesteś wzywany/a do konfrontacji z rzeczywistością swoich przeszłych doświadczeń i uznania przyczyny i skutku swoich działań. Jest to czas na autorefleksję, uczciwość i odpowiedzialność, pozwalające Ci wyjaśnić swoje intencje i przygotować się na przyszłość.

Teraz, gdy spoglądamy w przyszłość, Wieża wybucha objawieniem, które wstrząśnie fundamentami Twojego życia miłosnego. Ta karta przepowiada nagłą i głęboką zmianę, która początkowo może wydawać się katastroficzna, ale ostatecznie prowadzi do wyzwolenia od starego i odrodzenia w nowym. Spodziewaj się dramatycznego przewrotu, który utoruje drogę do bardziej autentycznego i głębokiego połączenia z sobą i innymi. Wieża sugeruje, że jesteś na skraju rewolucyjnej transformacji, która obudzi Cię do prawdziwej natury miłości i związków.


Przykładowy output:
{
  "cards": [
    {
      "title": "🔮 Przeszłość – Księżyc",
      "content": "Twoje życie miłosne było zaćmione iluzją i niepewnością. Wątpliwości i lęki mogły powstrzymywać Cię przed dostrzeżeniem prawdy."
    },
    {
      "title": "⚖️ Teraźniejszość – Sprawiedliwość",
      "content": "Wszechświat przywraca równowagę. To czas na uczciwość, refleksję i wzięcie odpowiedzialności za swoje wybory w miłości."
    },
    {
      "title": "🔥 Przyszłość – Wieża",
      "content": "Nadchodzi nagły wstrząs! Choć może wydawać się chaotyczny, ta transformacja utoruje drogę do głębszych, bardziej autentycznych połączeń."
    }
  ],
  "summary": "🌿 Zaufaj procesowi. Przyjmij prawdę. Miłość ewoluuje. 💫✨"
}
 `;

 const retrySystemPrompt = `Put the input into valid JSON format. If the input is already in JSON format, return it as is. If the input is not in JSON format return it in JSON format.

 Example Input:
 🔮 Przeszłość – Temperance
Twoje serce szukało równowagi i harmonii w relacjach, ucząc się cierpliwości i szukania celu w swoich relacjach. Ta karta wskazuje, że twoja przeszłość była okresem uczenia się i przygotowania do przyszłych relacji.

🌀 Teraźniejszość – The Hanged Man
Twoje serce jest gotowe do poddania się nowej perspektywie i oświeceniu, musisz puścić stare wzorce i oczekiwania, aby móc doświadczyć nowego i zdrowszego związku. To karta, która mówi: "Zatrzymaj się, zobacz świat z innej strony i pozwól, aby twoje serce zostało oświecone".

⚖️ Przyszłość – Justice
Twoje serce spotka sprawiedliwość i prawdę w relacjach, twoje działania i decyzje będą miały konsekwencje, ale także będziesz nagradzany/a za twoją uczciwość i autentyczność. Ta karta mówi, że zdrowy związek jest możliwy, jeśli będziesz postępował/a zgodnie z twoim sercem i będziesz szukał/a prawdy w swoich relacjach.

🌟🔮 Podsumowanie: 🌈 Zaufaj swojemu sercu i szukaj prawdy w relacjach. Przez równowagę, oświecenie i uczciwość, możesz przyciągnąć zdrowy związek. 🌟💫✨

Example Output:
{
  "cards": [
    {
      "title": "🔮 Przeszłość – Temperance",
      "content": "Twoje serce szukało równowagi i harmonii w relacjach, ucząc się cierpliwości i szukania celu w swoich relacjach. Ta karta wskazuje, że twoja przeszłość była okresem uczenia się i przygotowania do przyszłych relacji."
    },
    {
      "title": "🌀 Teraźniejszość – The Hanged Man",
      "content": "Twoje serce jest gotowe do poddania się nowej perspektywie i oświeceniu, musisz puścić stare wzorce i oczekiwania, aby móc doświadczyć nowego i zdrowszego związku. To karta, która mówi: "Zatrzymaj się, zobacz świat z innej strony i pozwól, aby twoje serce zostało oświecone."
    },
    {
      "title": "⚖️ Przyszłość – Justice",
      "content": "Twoje serce spotka sprawiedliwość i prawdę w relacjach, twoje działania i decyzje będą miały konsekwencje, ale także będziesz nagradzany/a za twoją uczciwość i autentyczność. Ta karta mówi, że zdrowy związek jest możliwy, jeśli będziesz postępował/a zgodnie z twoim sercem i będziesz szukał/a prawdy w swoich relacjach."
    }
  ],
  "summary": "🌟🔮 Podsumowanie: 🌈 Zaufaj swojemu sercu i szukaj prawdy w relacjach. Przez równowagę, oświecenie i uczciwość, możesz przyciągnąć zdrowy związek. 🌟💫✨"
}

Only respond in JSON, avoid statements like "Here is the JSON:" or similar.
 `

    let systemPrompt = systemPromptEn;
    if (locale === 'pl') {
      systemPrompt = systemPromptPl;
    }

    let ret = await generateText({
      model: togetherai("meta-llama/Llama-3.3-70B-Instruct-Turbo"),
      system: systemPrompt,
      prompt: reading,
    });

    let shouldRetry = false;
    try {
      JSON.parse(ret.text);
    } catch (error) {
      shouldRetry = true;
    }

    if (shouldRetry) {
      ret = await generateText({
        model: togetherai("meta-llama/Llama-3.3-70B-Instruct-Turbo"),
        system: retrySystemPrompt,
        prompt: ret.text,
      });
    }

    const { text } = ret;
    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 400 });
  }
}
