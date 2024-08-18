"use client";

import React from "react";

export default function Home() {
  const [volume, setVolume] = React.useState(0.5);
  const [rate, setRate] = React.useState(1);
  const [voices, setVoices] = React.useState<Array<SpeechSynthesisVoice>>([]);
  const [preText, setPreText] = React.useState("");
  const [readingText, setReadingText] = React.useState("");
  const [remainingText, setRemainingText] = React.useState("");
  const synth: SpeechSynthesis | null =
    typeof window !== "undefined" ? window.speechSynthesis : null;
  let speechUtterance = null;
  React.useEffect(() => {
    const populateVoiceList = () => {
      if (typeof synth === "undefined") {
        return;
      }
      const voices = synth?.getVoices();
      setVoices(voices || []);
    };
    populateVoiceList();

    // in Google Chrome the voices are not ready on page load
    if (synth && "onvoiceschanged" in synth) {
      synth.onvoiceschanged = populateVoiceList;
    }
    return () => {
      synth?.cancel();
    };
  }, [synth]);
  const onSpeakInit = () => {
    synth?.cancel();
    const textToSpeech = (
      document.getElementById("textToSpeech") as HTMLTextAreaElement
    )?.value;

    if (!textToSpeech) {
      alert("Please give some thoughts to read");
      return;
    }
    speechUtterance = new SpeechSynthesisUtterance(textToSpeech);

    const selectedVoice = (
      document.getElementById("voice") as HTMLSelectElement
    ).value;
    speechUtterance.voice = voices[Number(selectedVoice || 0)];

    speechUtterance.volume = volume;
    speechUtterance.rate = rate;

    const selectedPitch = (
      document.getElementById("pitch") as HTMLSelectElement
    ).value;
    speechUtterance.pitch = Number(selectedPitch || 1);
    // Split the text into words
    speechUtterance.onboundary = (event) => {
      let nextSpaceIndex = event.charIndex + event.charLength;
      let preText = textToSpeech.substring(0, event.charIndex);
      let readingText = textToSpeech.substring(event.charIndex, nextSpaceIndex);
      let remainingText = textToSpeech.substring(nextSpaceIndex);

      setPreText(preText);
      setReadingText(readingText);
      setRemainingText(remainingText);
    };
    const element = document.getElementById("parser");
    element?.scrollIntoView({ behavior: "smooth" });
    synth?.speak(speechUtterance);
  };
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-2'>
      <div className='min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <div className=''>
          <div className='rounded-md h-full w-full flex-row justify-center p-6'>
            <p className='font-bold'>{`Let's Read Together`}</p>
            <div className='pt-6'>
              <label
                htmlFor='message'
                className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
              >
                Your message
              </label>
              <textarea
                id='textToSpeech'
                rows={4}
                className='block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                placeholder='Write your thoughts here...'
              ></textarea>
            </div>
            <div className='pt-6'>
              <label
                htmlFor='volume-range'
                className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
              >
                Volume {parseInt(`${volume * 100}`)} %
              </label>
              <input
                id='volume-range'
                type='range'
                defaultValue='0.5'
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                }}
                min={0}
                max={1}
                step={0.05}
                className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700'
              />
            </div>
            <div className='pt-6'>
              <label
                htmlFor='rate'
                className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
              >
                Rate {rate}
              </label>
              <input
                id='rate'
                type='range'
                min={0.5}
                max={2}
                defaultValue={1}
                step={0.1}
                onChange={(e) => {
                  setRate(Number(e.target.value));
                }}
                className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700'
              />
            </div>
            <div className='pt-6'>
              <label
                htmlFor='pitch'
                className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
              >
                Select Pitch
              </label>
              <select
                id='pitch'
                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
              >
                <option value='0'>Low</option>
                <option selected value={1}>
                  Medium
                </option>
                <option value='2'>High</option>
              </select>
            </div>

            <div className='pt-6'>
              <label
                htmlFor='voice'
                className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
              >
                Select Voice
              </label>
              <select
                id='voice'
                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
              >
                {voices.map((voice, index) => {
                  return (
                    <option key={`${index}_voice`} value={index}>
                      {voice.name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className='pt-6'>
              <button
                onClick={onSpeakInit}
                type='button'
                className='focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800'
              >
                {`Let's Read`}
              </button>
              <button
                onClick={() => {
                  synth?.cancel();
                }}
                type='button'
                className='focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800'
              >
                stop
              </button>
            </div>
          </div>
        </div>
        <div id='parser' className='w-full h-full'>
          <div className='h-full w-[70%] rounded-md m-12 bg-white'>
            <p className='p-6 text-black'>
              <span>{preText}</span>
              <span className='bg-[#7F1B10] text-white'>{readingText}</span>
              <span>{remainingText}</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
