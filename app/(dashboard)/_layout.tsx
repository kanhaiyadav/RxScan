import { Tabs } from "expo-router";
import { images } from "@/constants/images";
import { Image, ImageBackground, Text, View, Animated } from "react-native";
import { icons } from "@/constants/icons";
import { useEffect, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

const ActiveTabBar = ({ icon, text, active }: {
  icon: any;
  text: string;
  active: boolean;
}) => {
  if (active) {
    return (
      <ImageBackground
        source={images.highlight}
        className="w-full min-w-[112px] flex flex-row flex-1 items-center justify-center gap-2 rounded-full min-h-[55px] mt-[20px] overflow-hidden"
      >
        <Image source={icon} tintColor={'#151312'} />
        <Text>
          {text}
        </Text>
      </ImageBackground>
    )
  }
  else {
    return (
      <View className="size-full justify-center items-center mt-4 rounded-full">
        <Image source={icon} tintColor={'#A8B5DB'} className="size-5" />
      </View>
    )
  }
}

// Custom animated wrapper component for tab screens
export const AnimatedTabScreen = ({ children }: { children: React.ReactNode }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      // Reset animation values
      slideAnim.setValue(-100);
      opacityAnim.setValue(0);

      // Start slide-from-top animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      return () => {
        // Cleanup if needed
      };
    }, [slideAnim, opacityAnim])
  );

  return (
    <Animated.View
      style={{
        flex: 1,
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
      }}
    >
      {children}
    </Animated.View>
  );
};

export default function _Layout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        animation: "fade",
        tabBarStyle: {
          backgroundColor: "#0f0d23",
          borderRadius: 50,
          marginHorizontal: 20,
          marginBottom: 18,
          height: 57,
          position: "absolute",
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "0f0d23"
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <ActiveTabBar
              icon={icons.home}
              text="Home"
              active={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <ActiveTabBar
              icon={icons.search}
              text="Search"
              active={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <ActiveTabBar
              icon={icons.save}
              text="Saved"
              active={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <ActiveTabBar
              icon={icons.person}
              text="Profile"
              active={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}