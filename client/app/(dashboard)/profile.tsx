import { View, Text } from 'react-native'
import React from 'react'
import { Link, useRouter } from 'expo-router'
import { AnimatedTabScreen } from './_layout'

const profile = () => {
  return (
    <AnimatedTabScreen>
      <View>
        <Text>profile</Text>
        <Link href={'/'} className="mt-[200px] ml-[150px] text-blue-500">
          Go to Home
        </Link>
      </View>
    </AnimatedTabScreen>
  )
}

export default profile