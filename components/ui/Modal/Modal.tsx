'use client'

import { PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
  cta: {
    text: string,
    type: string
  }
}

export default function Modal({children, cta}:Props) {


  return (
    <div>
        {/* @ts-ignore */}
        <button className={`w-full btn btn-${cta?.type}`} onClick={()=>document.getElementById('my_modal_2').showModal()}>{cta?.text || "open"}</button>
        <dialog id="my_modal_2" className="modal">
        <div className="modal-box">
        {children}
        </div>
        <form method="dialog" className="modal-backdrop">
            <button>close</button>
        </form>
        </dialog>
    </div>
  );
}
