import Predictions, {
  AmazonAIPredictionsProvider,
} from "@aws-amplify/predictions";
import Amplify from "aws-amplify";
import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import awsconfig from "./aws-exports";

Amplify.configure(awsconfig);
Amplify.addPluggable(new AmazonAIPredictionsProvider());

const videoConstraints = {
  width: 720,
  height: 360,
  facingMode: "user",
};

const Camera = () => {
  const [isCaptureEnable, setCaptureEnable] = useState<boolean>(false);
  const [response, setResponse] = useState("Please capture image.");
  const webcamRef = useRef<Webcam>(null);
  const [url, setUrl] = useState<string | null>(null);
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setUrl(imageSrc);
      Predictions.identify({
        text: {
          source: {
            bytes: imageSrc,
          },
          format: "ALL",
        },
      })
        .then((response) => {
          const {
            text: {
              // same as PLAIN + FORM + TABLE
              fullText,
            },
          } = response;
          setResponse(fullText);
        })
        .catch((err) => console.log({ err }));
    }
  }, [webcamRef]);

  return (
    <>
      <header>
        <h1>Camera</h1>
      </header>
      <div>result: {response}</div>
      {isCaptureEnable || (
        <button onClick={() => setCaptureEnable(true)}>Launch</button>
      )}
      {isCaptureEnable && (
        <>
          <div>
            <button onClick={() => setCaptureEnable(false)}>Finish</button>
          </div>
          <div>
            <Webcam
              audio={false}
              width={540}
              height={360}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
            />
          </div>
          <button onClick={capture}>Capture</button>
        </>
      )}
      {url && (
        <>
          <div>
            <button
              onClick={() => {
                setUrl(null);
              }}
            >
              Delete
            </button>
          </div>
          <div>
            <img src={url} alt="Screenshot" width={540} height={360} />
          </div>
        </>
      )}
    </>
  );
};

const IndexPage = () => {
  return (
    <>
      <Head>
        <title>Amplify Textract Demo</title>
      </Head>
      <Camera />
    </>
  );
};

export default IndexPage;
