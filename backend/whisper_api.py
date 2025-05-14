from fastapi import FastAPI, File, UploadFile, HTTPException
import whisper
import io

app = FastAPI()
model = whisper.load_model("base")  # small, medium, large 등 필요에 따라 선택

@app.post("/api/stt")
async def stt(audio: UploadFile = File(...)):
    # 업로드된 오디오 읽기
    data = await audio.read()
    try:
        # Whisper로 바로 디코딩
        result = model.transcribe(io.BytesIO(data), fp16=False)
        return {"text": result["text"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
