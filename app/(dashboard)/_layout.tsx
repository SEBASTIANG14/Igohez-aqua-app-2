import { Tabs } from 'expo-router';
import CustomTabBar from '@/components/ui/CustomTabBar';

export default function DashboardLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          // @ts-ignore
          tabBarIconName: 'home',
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarLabel: 'Agenda',
          // @ts-ignore
          tabBarIconName: 'event-note',
        }}
      />
      <Tabs.Screen
        name="calculator"
        options={{
          title: 'Calculator',
          tabBarLabel: 'Calculator',
          // @ts-ignore
          tabBarIconName: 'calculate',
        }}
      />
      <Tabs.Screen
        name="albercas"
        options={{
          title: 'Albercas',
          tabBarLabel: 'Albercas',
          // @ts-ignore
          tabBarIconName: 'pool',
        }}
      />
      {/* Hidden screens */}
      <Tabs.Screen
        name="nueva"
        options={{
          title: 'Nueva Alberca',
          // @ts-ignore
          tabBarHidden: true,
          tabBarIconName: 'add-circle',
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          href: null,
          // @ts-ignore
          tabBarHidden: true,
          tabBarIconName: 'assessment',
        }}
      />
      <Tabs.Screen
        name="new-service"
        options={{
          title: 'Nueva Visita',
          href: null,
          // @ts-ignore
          tabBarHidden: true,
          tabBarIconName: 'add-task',
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clientes',
          href: null,
          // @ts-ignore
          tabBarHidden: true,
          tabBarIconName: 'group',
        }}
      />
    </Tabs>
  );
}
