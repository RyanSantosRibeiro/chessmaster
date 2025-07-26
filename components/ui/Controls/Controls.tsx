'use client';

import { FC } from 'react';

type Props = {
  isPaused: boolean,
  stop?: () => void;
  resume?: () => void;
  restart?: () => void;
};


const Controls: FC<Props> = ({
  resume,
  stop,
  restart,
  isPaused
}) => {
  return (
    <div className="flex items-center justify-around w-ful p-2 gap-1">
        {
          stop && <button className={`btn btn-square focus:ring-transparent ${isPaused && "border-2 border-warning"} `} onClick={()=>stop()}>
            <svg width="14px" height="14px" viewBox="-1 0 8 8" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <defs>

          </defs>
              <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                  <g id="Dribbble-Light-Preview" transform="translate(-227.000000, -3765.000000)" fill="currentColor">
                      <g id="icons" transform="translate(56.000000, 160.000000)">
                          <path d="M172,3605 C171.448,3605 171,3605.448 171,3606 L171,3612 C171,3612.552 171.448,3613 172,3613 C172.552,3613 173,3612.552 173,3612 L173,3606 C173,3605.448 172.552,3605 172,3605 M177,3606 L177,3612 C177,3612.552 176.552,3613 176,3613 C175.448,3613 175,3612.552 175,3612 L175,3606 C175,3605.448 175.448,3605 176,3605 C176.552,3605 177,3605.448 177,3606" id="pause-[#1006]">

          </path>
                      </g>
                  </g>
              </g>
          </svg>
        </button> 
        }
        {resume && <button className={`btn btn-square focus:ring-transparent ${isPaused && "border-2 border-success"} `} onClick={()=>resume()}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"></path></svg>
        </button> }
        {restart && <button className="btn btn-square" onClick={()=>restart()}><svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 25C4 18.3502 9.39624 13 16 13H44" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"></path><path d="M38 7L44 13L38 19" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"></path><path d="M44 23C44 29.6498 38.6038 35 32 35H4" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"></path><path d="M10 41L4 35L10 29" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"></path></svg>
        </button>}
        <button className="btn btn-square"><svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 6V42C17 42 11.7985 32.8391 11.7985 32.8391H6C4.89543 32.8391 4 31.9437 4 30.8391V17.0108C4 15.9062 4.89543 15.0108 6 15.0108H11.7985C11.7985 15.0108 17 6 24 6Z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"></path><path d="M32 15L32 15C32.6232 15.5565 33.1881 16.1797 33.6841 16.8588C35.1387 18.8504 36 21.3223 36 24C36 26.6545 35.1535 29.1067 33.7218 31.0893C33.2168 31.7885 32.6391 32.4293 32 33" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"></path></svg>
        </button>
        {/* <button className="alert alert-soft">
          Surrender
        </button> */}
    </div>
  );
};

export default Controls;

{/* <button className="btn btn-square"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z"></path></svg>
</button> */}
{/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M21 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061A1.125 1.125 0 0 1 21 8.689v8.122ZM11.25 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061a1.125 1.125 0 0 1 1.683.977v8.122Z"></path></svg> */}