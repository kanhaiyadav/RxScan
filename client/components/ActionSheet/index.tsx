import { View, Text } from 'react-native'
import React from 'react'
import {
    Actionsheet,
    ActionsheetBackdrop,
    ActionsheetContent,
    ActionsheetDragIndicator,
    ActionsheetDragIndicatorWrapper,
    ActionsheetScrollView
} from "@/components/ui/actionsheet";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/Store/store';
import { closeActionSheet } from '@/Store/slices/UIslice';

const Index = () => {

    const showActionsheet = useSelector((state: RootState) => state.ui.isActionSheetOpen);
    const actionSheetContent = useSelector((state: RootState) => state.ui.actionSheetContent);
    const name = actionSheetContent.name;
    const dispatch = useDispatch();

    const renderContent = () => {
        return (
            name === 'example' ? (
                <Text>This is an example content</Text>
            ) : (
                <Text>This is some other content</Text>
            )
        )
    }
    
  return (
      <Actionsheet isOpen={showActionsheet} onClose={() => dispatch(closeActionSheet())}>
          <ActionsheetBackdrop />
          <ActionsheetContent>
              <ActionsheetDragIndicatorWrapper>
                  <ActionsheetDragIndicator />
              </ActionsheetDragIndicatorWrapper>
              <ActionsheetScrollView className="max-h-[600px] overflow-auto" showsVerticalScrollIndicator={false}>
                  {renderContent()}
              </ActionsheetScrollView>
          </ActionsheetContent>
      </Actionsheet>
  )
}

export default Index