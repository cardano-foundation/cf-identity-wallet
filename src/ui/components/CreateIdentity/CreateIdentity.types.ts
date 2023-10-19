interface CreateIdentityProps {
  modalIsOpen: boolean;
  setModalIsOpen: (value: boolean) => void;
}

interface TypeItemProps {
  index: number;
  text: string;
}

export type { CreateIdentityProps, TypeItemProps };
