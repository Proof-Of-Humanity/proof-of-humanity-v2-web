'use client';

import cn from 'classnames';
import Popup from 'reactjs-popup';

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  trigger?: JSX.Element | ((isOpen: boolean) => JSX.Element);
  children: React.ReactNode;
  open?: boolean;
  onClose?: () => void;
  className?: string;
  formal?: boolean;
  header?: string;
}

const Modal: React.FC<ModalProps> = ({
  formal,
  header,
  className,
  trigger,
  children,
  open,
  onClose,
}) => (
  <Popup modal trigger={trigger} closeOnEscape={false} open={open}>
    {(close) => (
      <>
        <div
          className="backdrop"
          onClick={() => {
            close();
            if (onClose) onClose();
          }}
        />
        <div
          className={cn(
            'absolute-centered fixed z-30 w-4/5 md:w-3/5 xl:w-2/5',
            { 'bg-whiteBackground border-stroke overflow-clip rounded border': formal },
            className,
          )}
        >
          {header && (
            <div className="gradient py-2 text-center font-semibold uppercase text-white">
              {header}
            </div>
          )}
          {children}
        </div>
      </>
    )}
  </Popup>
);

export default Modal;
