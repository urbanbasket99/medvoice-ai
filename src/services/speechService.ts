export const uploadAudio = async (audioBlob: Blob) => {

    const formData = new FormData();

    formData.append("audio", audioBlob, "doctor-recording.webm");

    try {

        const response = await fetch("http://localhost:5000/api/speech", {

            method: "POST",

            body: formData,

        });

        return await response.json();

    } catch (error) {

        console.log(error);

    }

};