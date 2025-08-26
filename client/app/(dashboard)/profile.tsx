import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogBody,
    AlertDialogBackdrop,
} from "@/components/ui/alert-dialog"
import { Button, ButtonText } from "@/components/ui/button"
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { selectHealthProfile } from '@/Store/slices/healthProfileSlice';
import { useSelector } from 'react-redux';
import {
    Accordion,
    AccordionItem,
    AccordionHeader,
    AccordionTrigger,
    AccordionIcon,
    AccordionContent,
} from "@/components/ui/accordion"
import { Divider } from "@/components/ui/divider"
import { ChevronUpIcon, ChevronDownIcon, Icon, EditIcon } from "@/components/ui/icon"
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function ProfileScreen() {
    const { t } = useTranslation();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = useState(false);
    const [showAlertDialog, setShowAlertDialog] = React.useState(false)
    const handleClose = () => setShowAlertDialog(false)

    const healthProfile = useSelector(selectHealthProfile);

    const router = useRouter();
    const { signOut, user } = useAuth();

    // Function to get user initials
    const getUserInitials = (name: string | undefined): string => {
        if (!name) return 'U';
        const names = name.trim().split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        return names[0][0].toUpperCase();
    };

    const getProfileColor = (userId: string | undefined): string => {
        if (!userId) return '#6B7280';

        const colors: string[] = [
            '#EF4444', // red-500
            '#F97316', // orange-500
            '#F59E0B', // amber-500
            '#EAB308', // yellow-500
            '#84CC16', // lime-500
            '#22C55E', // green-500
            '#10B981', // emerald-500
            '#14B8A6', // teal-500
            '#06B6D4', // cyan-500
            '#0EA5E9', // sky-500
            '#3B82F6', // blue-500
            '#6366F1', // indigo-500
            '#8B5CF6', // violet-500
            '#A855F7', // purple-500
            '#D946EF', // fuchsia-500
            '#EC4899', // pink-500
        ];

        // Use the user ID to generate a consistent index
        let hash: number = 0;
        for (let i = 0; i < userId.length; i++) {
            hash = userId.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    // Function to format date
    const formatMemberSince = (dateString: string | undefined): string => {
        if (!dateString) return t('member');

        const date = new Date(dateString);
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const year = date.getFullYear();
        return t('memberSince', { month, year });
    };

    const profileSections = [
        {
            title: t('healthInformation'),
            items: [
                {
                    icon: 'warning',
                    title: t('allergies'),
                    subtitle: t('allergiesListed'),
                    color: 'bg-orange-500',
                    route: '/profile/allergies',
                    slug: 'allergies'
                },
                {
                    icon: 'medical',
                    title: t('medicalConditions'),
                    subtitle: t('medicalConditionsAdded'),
                    color: 'bg-red-500',
                    route: '/(onboarding)',
                    slug: 'medicalConditions'
                },
                {
                    icon: 'medkit',
                    title: t('currentMedications'),
                    subtitle: t('activeMedicines'),
                    color: 'bg-blue-500',
                    route: '/profile/medications',
                    slug: 'currentMedications'
                },
                {
                    icon: 'restaurant',
                    title: t('dietaryRestrictions'),
                    subtitle: t('dietaryRestrictionsCount'),
                    color: 'bg-green-500',
                    route: '/profile/diet',
                    slug: 'dietaryRestrictions'
                }
            ]
        },
        {
            title: t('appSettings'),
            items: [
                {
                    icon: 'notifications',
                    title: t('notifications'),
                    subtitle: t('manageYourAlerts'),
                    color: 'bg-purple-500',
                    hasToggle: true,
                    toggleValue: notificationsEnabled,
                    onToggle: setNotificationsEnabled
                },
                {
                    icon: 'moon',
                    title: t('darkMode'),
                    subtitle: t('switchToDarkTheme'),
                    color: 'bg-gray-700',
                    hasToggle: true,
                    toggleValue: darkModeEnabled,
                    onToggle: setDarkModeEnabled
                },
                {
                    icon: 'shield-checkmark',
                    title: t('privacySecurity'),
                    subtitle: t('manageYourData'),
                    color: 'bg-teal-500',
                    route: '/profile/privacy'
                }
            ]
        },
        {
            title: t('supportAbout'),
            items: [
                {
                    icon: 'help-circle',
                    title: t('helpSupport'),
                    subtitle: t('getHelpWithApp'),
                    color: 'bg-cyan-500',
                    route: '/profile/help'
                },
                {
                    icon: 'document-text',
                    title: t('termsOfService'),
                    subtitle: t('readOurTerms'),
                    color: 'bg-amber-500',
                    route: '/profile/terms'
                },
                {
                    icon: 'shield',
                    title: t('privacyPolicy'),
                    subtitle: t('howWeProtectData'),
                    color: 'bg-emerald-500',
                    route: '/profile/privacy-policy'
                },
                {
                    icon: 'information-circle',
                    title: t('about'),
                    subtitle: t('version'),
                    color: 'bg-pink-500',
                    route: '/profile/about'
                }
            ]
        }
    ];

    const handleLogout = () => {
        signOut();
        setShowAlertDialog(false);
        router.replace('/(auth)/signin')
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" backgroundColor="#00ffc8" />

            {/* Header */}
            <LinearGradient
                colors={['#00ffc8', '#80f7ed']} // teal-500 to teal-600
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{ elevation: 3 }}
                className='border-b border-gray-200'
            >
                <View className="px-6 py-4 pt-8">
                    <Text className="text-2xl font-bold text-typography-900">{t('profile')}</Text>
                    <Text className="text-sm text-typography-600">{t('profileInformation')}</Text>
                </View>
            </LinearGradient>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* User Info Card */}
                <View className='m-6 p-6 bg-background-0'
                    style={{
                        borderRadius: 20,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.12,
                        shadowRadius: 12,
                        elevation: 2
                    }}
                >
                    <View className="flex-row items-center">
                        {/* Profile Picture with Initials */}
                        <View
                            className="w-20 h-20 rounded-full items-center justify-center mr-5"
                            style={{
                                backgroundColor: getProfileColor(user?.$id),
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.15,
                                shadowRadius: 4,
                                elevation: 3
                            }}
                        >
                            <Text className="text-white text-3xl font-bold">
                                {getUserInitials(user?.name)}
                            </Text>
                        </View>

                        {/* User Details */}
                        <View className="flex-1">
                            <Text className="text-typography-900 text-xl font-bold mb-1">
                                {user?.name || 'User'}
                            </Text>
                            <Text className="text-typography-600 text-sm mb-1">
                                {user?.email || 'email@example.com'}
                            </Text>
                            <View className="flex-row items-center">
                                <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                                <Text className="text-typography-500 text-xs ml-1">
                                    {formatMemberSince(user?.registration)}
                                </Text>
                            </View>

                            {/* Email Verification Badge */}
                            <View className="flex-row items-center mt-2">
                                <View className={`flex-row items-center px-2 py-1 rounded-full ${user?.emailVerification ? 'bg-green-100' : 'bg-yellow-100'
                                    }`}>
                                    <Ionicons
                                        name={user?.emailVerification ? "checkmark-circle" : "alert-circle"}
                                        size={12}
                                        color={user?.emailVerification ? "#10B981" : "#F59E0B"}
                                    />
                                    <Text className={`text-xs ml-1 font-medium ${user?.emailVerification ? 'text-green-700' : 'text-yellow-700'
                                        }`}>
                                        {user?.emailVerification ? t('verified') : t('unverified')}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Edit Button */}
                        <TouchableOpacity
                            className="bg-primary-100 p-3 rounded-full ml-2"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.1,
                                shadowRadius: 2,
                                elevation: 2
                            }}
                        >
                            <Icon as={EditIcon} className='text-primary-600' />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Profile Sections */}
                <View className="mx-6 mt-4">
                    <View className='flex-row justify-between'>
                        <Text className="text-lg font-semibold text-typography-900 mb-4">{profileSections[0].title}</Text>
                        <TouchableOpacity
                            className="flex-row items-center"
                            onPress={() => router.push('/(onboarding)/')}
                        >
                            <Icon as={EditIcon} className='text-typography-900 mr-2' />
                        </TouchableOpacity>
                    </View>
                    <View className="">
                        <Accordion
                            size="md"
                            variant="filled"
                            type="single"
                            isCollapsible={true}
                            isDisabled={false}
                            className="border border-outline-200 rounded-2xl overflow-hidden"
                        >
                            {profileSections[0].items.map((item, itemIndex) => (
                                <View key={itemIndex}>
                                    <AccordionItem value={item.title} className='p-1'>
                                        <AccordionHeader>
                                            <AccordionTrigger>
                                                {({ isExpanded }: { isExpanded: boolean }) => {
                                                    return (
                                                        <>
                                                            <View className='flex-row gap-4'>
                                                                <View className={`${item.color} w-10 h-10 rounded-full items-center justify-center mb-2`}>
                                                                    <Ionicons name={item.icon as any} size={20} color="white" />
                                                                </View>
                                                                <View>
                                                                    <Text className='text-md font-bold'>{item.title}</Text>
                                                                    <Text className='text-sm text-typography-500'>{`${healthProfile && 'slug' in item && item.slug && (healthProfile as any)[item.slug] ? (healthProfile as any)[item.slug].length : 0} ${item.subtitle}`}</Text>
                                                                </View>
                                                            </View>
                                                            {isExpanded ? (
                                                                <AccordionIcon as={ChevronUpIcon} className="ml-3" />
                                                            ) : (
                                                                <AccordionIcon as={ChevronDownIcon} className="ml-3" />
                                                            )}
                                                        </>
                                                    )
                                                }}
                                            </AccordionTrigger>
                                        </AccordionHeader>
                                        <AccordionContent>
                                            <View className='w-full h-full flex-row flex-wrap gap-2'>
                                                {healthProfile && 'slug' in item && item.slug && (healthProfile as any)[item.slug] && (healthProfile as any)[item.slug].map((detail: any, detailIndex: number) => (
                                                    <View key={detailIndex} className='bg-gray-100 p-2 px-3 rounded-md'>
                                                        {
                                                            'slug' in item && item.slug !== 'currentMedications' ?
                                                                <Text className='text-sm text-typography-700'>{detail}</Text>
                                                                : <View className='m-1'>
                                                                    <Text className='text-sm text-typography-700'>{`${detail.name} ${detail.dosage ? `(${detail.dosage})` : ''}`}</Text>
                                                                    <Text className='text-sm text-typography-700'>{detail.frequency}</Text>
                                                                </View>
                                                        }
                                                    </View>
                                                ))}
                                            </View>
                                        </AccordionContent>
                                    </AccordionItem>
                                    <Divider className={`${itemIndex < profileSections[0].items.length - 1 ? 'block' : 'hidden'}`} />
                                </View>
                            ))}
                        </Accordion>
                    </View>
                </View>

                {/* App Settings Section */}
                <View className="mx-6 mt-4">
                    <Text className="text-lg font-semibold text-typography-900 mb-4">{profileSections[1].title}</Text>
                    <View className="bg-background-0 rounded-2xl shadow-sm border border-gray-100">
                        {profileSections[1].items.map((item, itemIndex) => (
                            <TouchableOpacity
                                key={itemIndex}
                                className={`p-5 flex-row items-center ${itemIndex < profileSections[1].items.length - 1 ? 'border-b border-gray-100' : ''
                                    }`}
                                onPress={() => {
                                    if (item.route) {
                                        // Navigate to route
                                        router.push(item.route as any);
                                    }
                                }}
                            >
                                <View className={`${item.color} w-10 h-10 rounded-full items-center justify-center mr-4`}>
                                    <Ionicons name={item.icon as any} size={20} color="white" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-typography-900 font-medium">{item.title}</Text>
                                    <Text className="text-typography-500 text-sm mt-1">{item.subtitle}</Text>
                                </View>
                                {'hasToggle' in item && item.hasToggle ? (
                                    <Switch
                                        value={'toggleValue' in item ? item.toggleValue : false}
                                        onValueChange={'onToggle' in item ? item.onToggle : undefined}
                                        trackColor={{ false: '#E5E7EB', true: '#14B8A6' }}
                                        thumbColor="#FFFFFF"
                                    />
                                ) : (
                                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                                )}
                            </TouchableOpacity>
                        ))}

                        {/* Language Switcher - Add after other settings */}
                        <View className="border-t border-gray-100">
                            <LanguageSwitcher />
                        </View>
                    </View>
                </View>

                {/* Support & About Section */}
                <View className="mx-6 mt-4">
                    <Text className="text-lg font-semibold text-typography-900 mb-4">{profileSections[2].title}</Text>
                    <View className="bg-background-0 rounded-2xl shadow-sm border border-gray-100">
                        {profileSections[2].items.map((item, itemIndex) => (
                            <TouchableOpacity
                                key={itemIndex}
                                className={`p-5 flex-row items-center ${itemIndex < profileSections[2].items.length - 1 ? 'border-b border-gray-100' : ''
                                    }`}
                                onPress={() => {
                                    if (item.route) {
                                        // Navigate to route
                                        router.push(item.route as any);
                                    }
                                }}
                            >
                                <View className={`${item.color} w-10 h-10 rounded-full items-center justify-center mr-4`}>
                                    <Ionicons name={item.icon as any} size={20} color="white" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-typography-900 font-medium">{item.title}</Text>
                                    <Text className="text-typography-500 text-sm mt-1">{item.subtitle}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Logout Button */}
                <View className="mx-6 mt-8 mb-8">
                    <TouchableOpacity
                        className="bg-red-50 border border-red-200 rounded-2xl p-3 flex-row items-center justify-center"
                        onPress={() => setShowAlertDialog(true)}
                    >
                        <Ionicons name="log-out" size={24} color="#EF4444" />
                        <Text className="text-red-600 font-semibold ml-2 text-lg">{t('logout')}</Text>
                    </TouchableOpacity>
                    <AlertDialog isOpen={showAlertDialog} onClose={handleClose} size="md">
                        <AlertDialogBackdrop />
                        <AlertDialogContent className='bg-red-100 border-0'>
                            <AlertDialogHeader>
                                <Text className='text-xl font-bold'>
                                    {t('logoutTitle')}
                                </Text>
                            </AlertDialogHeader>
                            <AlertDialogBody className="mt-3 mb-4">
                                <Text className='text-typography-500'>
                                    {t('logoutMessage')}
                                </Text>
                            </AlertDialogBody>
                            <AlertDialogFooter className="">
                                <Button
                                    action="secondary"
                                    onPress={handleClose}
                                    size="sm"
                                    className='bg-background-0 elevation-sm'
                                >
                                    <ButtonText>{t('cancel')}</ButtonText>
                                </Button>
                                <Button size="sm" className='bg-red-600' onPress={handleLogout}>
                                    <ButtonText>{t('logout')}</ButtonText>
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
