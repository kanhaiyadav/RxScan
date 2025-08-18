import { Image } from 'react-native'
import React from 'react'
import {
    Modal,
    ModalBackdrop,
    ModalContent,
    // ModalCloseButton,
    // ModalHeader,
    // ModalBody,
    // ModalFooter,
} from "@/components/ui/modal"
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/Store/store'
import { closeModal } from '@/Store/slices/modalSlice'

const ModalManager = () => {

    const modalState = useSelector((state: RootState) => state.modal);
    const dispatch = useDispatch();

    const Content = () => {

        return modalState.content?.name === "img" ? (
            <ModalContent size='lg' className='bg-black/40 h-fit px-0'>
                <Image
                    source={{ uri: modalState.content.data.imgUrl }}
                    style={{ borderRadius: 15 }}
                    className='w-full aspect-[3/4]'
                    resizeMode="contain"
                />
            </ModalContent>
        ) : null;
    }
    
  return (
      <Modal
          isOpen={modalState.isOpen}
          onClose={() => {
              dispatch(closeModal());
          }}
          size="md"
      >
          <ModalBackdrop />
          <Content />
      </Modal>
  )
}

export default ModalManager