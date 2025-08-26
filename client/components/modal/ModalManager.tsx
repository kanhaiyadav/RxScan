import {
    Modal,
    ModalBackdrop,
    ModalContent,
} from "@/components/ui/modal"
import { closeModal } from '@/Store/slices/modalSlice'
import { RootState } from '@/Store/store'
import LottieView from 'lottie-react-native'
import React from 'react'
import { Image, Text, TouchableOpacity } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import successAnimation from '@/assets/lottie/check.json';
import errorAnimation from '@/assets/lottie/wrong.json';
import Ionicons from '@expo/vector-icons/Ionicons';

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
        ) : modalState.content?.name === "status" ? (
            <ModalContent size='md' className='bg-background-0 h-fit rounded-xl items-center realtive'>
                <LottieView
                    source={modalState.content.data.type === "error" ? errorAnimation : successAnimation}
                    autoPlay
                    loop={false}
                    style={{ width: 200, height: 150 }}
                />
                <Text className='mt-4 text-2xl font-semibold'>{modalState.content.title}</Text>
                <Text className='mt-2 text-typography-600 text-center text-wrap w-[90%]'>{modalState.content.description}</Text>
                <TouchableOpacity className='absolute top-2 right-2' onPress={() => dispatch(closeModal())}>
                    <Ionicons name="close" size={24} color="black" />
                </TouchableOpacity>
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
            style={{ zIndex: 1100 }}
        >
            <ModalBackdrop />
            <Content />
        </Modal>
    )
}

export default ModalManager