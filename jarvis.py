#!/usr/bin/env python3
"""
J.A.R.V.I.S - Just A Rather Very Intelligent System
Assistente de voz que controla o PC via comandos de voz.
Usa MiMo Auto como IA e Vosk para reconhecimento offline.
"""

import os
import sys
import json
import wave
import struct
import tempfile
import subprocess
import sounddevice as sd
from vosk import Model, KaldiRecognizer

MODEL_URL = "https://alphacephei.com/vosk/models/vosk-model-small-pt-0.3.zip"
MODEL_DIR = os.path.expanduser("~/.cache/vosk-model-pt")
MODEL_ZIP = MODEL_DIR + ".zip"

SAMPLE_RATE = 16000
BLOCK_SIZE = 8000

JARVIS_PROMPT = """Voce e o JARVIS, um assistente de IA que controla o computador do usuario.
O usuario vai te dar comandos de voz e voce deve responder com o que vai fazer.

REGRAS:
- Responda SEMPRE em português brasileiro
- Seja direto e curto (max 2 frases)
- Quando o usuario pedir para abrir algo, responda confirmando o que vai fazer
- Formato da resposta: apenas a acao que sera executada
- Exemplos de comandos que voce entende:
  - "abra o chrome" -> responda: Abrindo o Chrome
  - "pesquise no youtube" -> responda: Pesquisando no YouTube
  - "abra o terminal" -> responda: Abrindo o terminal
  - "que horas sao" -> responda com as horas atuais
  - "desligue o computador" -> responda confirmando
  - "abra o gerenciador de arquivos" -> responda: Abrindo o gerenciador de arquivos
  - "feche tudo" -> responda confirmando
- Se nao entender, responda: Nao entendi o comando. Pode repetir?
- NAO execute nada, apenas responda o que voce VAI fazer"""


def download_model():
    if os.path.exists(os.path.join(MODEL_DIR, "mfcc.conf")):
        return True

    print("📥 Baixando modelo de voz (primeira vez, ~50MB)...")
    try:
        import urllib.request
        import zipfile

        os.makedirs(MODEL_DIR, exist_ok=True)
        urllib.request.urlretrieve(MODEL_URL, MODEL_ZIP)
        with zipfile.ZipFile(MODEL_ZIP, 'r') as z:
            z.extractall(MODEL_DIR)
        os.remove(MODEL_ZIP)

        for item in os.listdir(MODEL_DIR):
            item_path = os.path.join(MODEL_DIR, item)
            if os.path.isdir(item_path) and item.startswith("vosk-model"):
                for f in os.listdir(item_path):
                    os.rename(os.path.join(item_path, f), os.path.join(MODEL_DIR, f))
                os.rmdir(item_path)
                break

        print("✅ Modelo instalado!")
        return True
    except Exception as e:
        print(f"❌ Erro ao baixar modelo: {e}")
        print("   Instale manualmente: https://alphacephei.com/vosk/models")
        return False


def query_mimo(text):
    prompt = JARVIS_PROMPT + f"\n\nUsuario: {text}\nJarvis:"
    escaped = prompt.replace('"', '\\"').replace('`', '\\`').replace('$', '\\$')
    try:
        result = subprocess.run(
            ['mimo', 'run', escaped],
            capture_output=True, text=True, timeout=30
        )
        reply = result.stdout.strip()
        lines = reply.split('\n')
        clean = '\n'.join(l for l in lines if not l.startswith('>') and 'build' not in l and '·' not in l)
        return clean.strip() if clean.strip() else None
    except Exception as e:
        print(f"❌ Erro MiMo: {e}")
        return None


def execute_command(response):
    r = response.lower()

    if any(w in r for w in ["chrome", "navegador", "google"]):
        subprocess.Popen(["xdg-open", "https://www.google.com"])
        return True
    if "youtube" in r:
        subprocess.Popen(["xdg-open", "https://www.youtube.com"])
        return True
    if "terminal" in r or "console" in r:
        for term in ["gnome-terminal", "konsole", "xterm", "alacritty"]:
            if subprocess.run(["which", term], capture_output=True).returncode == 0:
                subprocess.Popen([term])
                return True
    if "firefox" in r:
        subprocess.Popen(["firefox"])
        return True
    if "gerenciador" in r or "arquivos" in r or "files" in r:
        subprocess.Popen(["xdg-open", os.path.expanduser("~")])
        return True
    if "desligar" in r or "desligue" in r or "shutdown" in r:
        subprocess.run(["sudo", "shutdown", "-h", "now"])
        return True
    if "reiniciar" in r or "reboot" in r:
        subprocess.run(["sudo", "reboot"])
        return True
    if "bloquear" in r or "lock" in r:
        subprocess.Popen(["xdg-screensaver", "lock"])
        return True
    if "calculadora" in r or "calc" in r:
        subprocess.Popen(["gnome-calculator"])
        return True
    if "fechar" in r and ("tudo" in r or "all" in r):
        subprocess.run(["pkill", "-f", "chrome"])
        subprocess.run(["pkill", "-f", "firefox"])
        return True
    if "horas" in r or "hora" in r or "relogio" in r:
        import datetime
        now = datetime.datetime.now().strftime("%H:%M")
        print(f"🕐 São {now}")
        return True

    return False


def main():
    print("\n" + "=" * 50)
    print("  J.A.R.V.I.S - Assistente de Voz")
    print("  Just A Rather Very Intelligent System")
    print("=" * 50)
    print()

    if not download_model():
        sys.exit(1)

    print(" carregando modelo de voz...")
    model = Model(MODEL_DIR)
    rec = KaldiRecognizer(model, SAMPLE_RATE)
    rec.SetWords(True)

    print("🎤 Microfone pronto!")
    print("   Fale algo... (Ctrl+C para sair)")
    print()

    with sd.RawInputStream(
        samplerate=SAMPLE_RATE,
        blocksize=BLOCK_SIZE,
        dtype='int16',
        channels=1
    ) as stream:
        while True:
            data = stream.read(BLOCK_SIZE)
            if rec.AcceptWaveform(bytes(data)):
                result = json.loads(rec.Result())
                text = result.get("text", "").strip()

                if not text:
                    continue

                print(f"🗣️  Voce: {text}")

                reply = query_mimo(text)
                if reply:
                    print(f"🤖 Jarvis: {reply}")
                    execute_command(reply)
                else:
                    print("🤖 Jarvis: Desculpe, nao consegui processar.")

                print()

            else:
                partial = json.loads(rec.PartialResult())
                pt = partial.get("partial", "").strip()
                if pt:
                    print(f"\r   🔄 {pt}...", end="", flush=True)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Jarvis desligando. Ate logo!")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Erro fatal: {e}")
        sys.exit(1)
