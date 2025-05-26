
import { PropsWithChildren } from 'react';

export default async function Modal({children}:PropsWithChildren) {


  return (
    <div>
        <button className="btn" onClick={()=>document.getElementById('my_modal_2').showModal()}>open modal</button>
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
