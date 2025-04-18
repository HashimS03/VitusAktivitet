import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Dashboard and Navigation
import Dashboard from "../components/dashboard/dashboard";
import EventsNavigation from "../components/events/events-navigation";
import Navbar from "../components/navbar/navbar";
import Leaderboard from "../components/leaderboard/leaderboard";
import HistoryScreen from "../components/dashboard/history";

// Authentication Screens
import StartScreen from "../components/startscreen/startscreen";
import LoginScreen from "../components/login/login";
import CreateAccountScreen from "../components/opprett/opprett";

// User Profile and Settings
import Stats from "../components/profile/stats";
import Setting from "../components/Setting/setting";
import TrophyDetails from "../components/profile/TrophyDetails";
import Achievements from "../components/profile/achievements";
import Notifications from "../components/notifications/notifications";
import LanguageSelection from "../components/Setting/language";
import EditProfile from "../components/Setting/editprofile";
import NotificationEditor from "../components/Setting/notificationediror";
import Theme from "../components/Setting/theme";
import ContactUs from "../components/Setting/contactus";
import HelpSupport from "../components/Setting/helpsupport";
import SecurityPrivacy from "../components/Setting/securityprivacy";
import PrivacyPolicy from "../components/Setting/privacypolicy";
import { ThemeProvider } from "../components/context/ThemeContext";
import EditAvatar from "../components/Setting/editavatar";

// Events and Event Management
import JoinEvent from "../components/events/JoinEvent";
import NewEvent from "../components/events/NewEvent";
import ActiveEvent from "../components/events/activeevent";
import InviteMembersScreen from "../components/events/InviteMembersScreen";
import LogRecordingScreen from "../components/events/LogRecordingScreen";
import EventLeaderboard from "../components/events/EventLeaderboard";
import YourEvents from "../components/events/your-events";

import ActivitySelect from "../components/stepconverter/activityselect";
import DurationSelect from "../components/stepconverter/durationselect";
import Confirmation from "../components/stepconverter/confirmation";

// User Selection Screens
import GenderSelection from "../components/genderselection/genderselection";
import DepartmentSelection from "../components/departmentselection/departmentselection";
import AvatarSelection from "../components/avatarselection/avatarselection";

// Import EventProvider and UserProvider
import { EventProvider } from "../components/events/EventContext";
import { UserProvider } from "../components/context/UserContext";

// Create Navigators
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/** Events Stack - Handles event-related screens */
const EventsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="EventsMain" component={EventsNavigation} />
    <Stack.Screen
      name="JoinEvent"
      component={JoinEvent}
      options={{ tabBarStyle: { display: "none" } }}
    />
    <Stack.Screen
      name="NewEvent"
      component={NewEvent}
      options={{ tabBarStyle: { display: "none" } }}
    />
    <Stack.Screen
      name="InviteMembers"
      component={InviteMembersScreen}
      options={{
        presentation: "transparentModal",
        animation: "fade",
      }}
    />
  </Stack.Navigator>
);

/** Bottom Tab Navigator - Main App Navigation */
const TabNavigator = () => (
  <Tab.Navigator
    tabBar={(props) => {
      const { state, navigation } = props;
      const currentRoute = state.routes[state.index].name;
      const childRoute = navigation
        .getState()
        .routes[state.index].state?.routes.slice(-1)[0]?.name;
      const routesWithoutNavbar = ["NewEvent", "JoinEvent"];

      if (
        currentRoute === "Events" &&
        routesWithoutNavbar.includes(childRoute)
      ) {
        return null;
      }

      return <Navbar {...props} />;
    }}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Home" component={Dashboard} />
    <Tab.Screen name="Leaderboard" component={Leaderboard} />
    <Tab.Screen name="Events" component={EventsStack} />
  </Tab.Navigator>
);

/** Root Stack Navigator - Handles authentication & app navigation */
const AppContent = () => {
  console.log("AppContent rendering"); // Debug log
  return (
    <Stack.Navigator
      initialRouteName="Start"
      screenOptions={{ headerShown: false }}
    >
      {/* Authentication Screens */}
      <Stack.Screen name="Start">
        {(props) => {
          console.log("StartScreen rendering"); // Debug log
          return <StartScreen {...props} />;
        }}
      </Stack.Screen>
      <Stack.Screen name="Login">
        {(props) => {
          console.log("LoginScreen rendering"); // Debug log
          return (
            <LoginScreen
              {...props}
              onLoginSuccess={() =>
                props.navigation.reset({
                  index: 0,
                  routes: [{ name: "MainApp" }],
                })
              }
            />
          );
        }}
      </Stack.Screen>
      <Stack.Screen name="SignUp">
        {(props) => {
          console.log("CreateAccountScreen rendering"); // Debug log
          return (
            <CreateAccountScreen
              {...props}
              onSignUpSuccess={() =>
                props.navigation.reset({
                  index: 0,
                  routes: [{ name: "MainApp" }],
                })
              }
            />
          );
        }}
      </Stack.Screen>
      {/* Gender Selection */}
      <Stack.Screen name="GenderSelection">
        {(props) => {
          console.log("GenderSelection rendering"); // Debug log
          return (
            <GenderSelection
              {...props}
              onComplete={(gender) => console.log("Selected Gender:", gender)}
            />
          );
        }}
      </Stack.Screen>
      {/* Department Selection */}
      <Stack.Screen name="DepartmentSelection">
        {(props) => {
          console.log("DepartmentSelection rendering"); // Debug log
          return (
            <DepartmentSelection
              {...props}
              onComplete={(department) =>
                console.log("Selected Department:", department)
              }
            />
          );
        }}
      </Stack.Screen>
      {/* History */}
      <Stack.Screen name="History">
        {(props) => {
          console.log("HistoryScreen rendering"); // Debug log
          return <HistoryScreen {...props} />;
        }}
      </Stack.Screen>
      {/* Avatar Selection */}
      <Stack.Screen name="AvatarSelection">
        {(props) => {
          console.log("AvatarSelection rendering"); // Debug log
          return <AvatarSelection {...props} />;
        }}
      </Stack.Screen>
      {/* Main App (Tabs) */}
      <Stack.Screen
        name="MainApp"
        component={TabNavigator}
        options={{ gestureEnabled: false }}
      />
      {/* Other Screens */}
      <Stack.Screen name="Setting">
        {(props) => {
          console.log("Setting rendering"); // Debug log
          return <Setting {...props} />;
        }}
      </Stack.Screen>
      <Stack.Screen name="EditAvatar">
        {(props) => {
          console.log("EditAvatar rendering"); // Debug log
          return <EditAvatar {...props} />;
        }}
      </Stack.Screen>
      <Stack.Screen name="Stats">
        {(props) => {
          console.log("Stats rendering"); // Debug log
          return <Stats {...props} />;
        }}
      </Stack.Screen>
      <Stack.Screen name="TrophyDetails">
        {(props) => {
          console.log("TrophyDetails rendering"); // Debug log
          return <TrophyDetails {...props} />;
        }}
      </Stack.Screen>
      <Stack.Screen name="Notifications">
        {(props) => {
          console.log("Notifications rendering"); // Debug log
          return <Notifications {...props} />;
        }}
      </Stack.Screen>
      <Stack.Screen name="Language">
        {(props) => {
          console.log("LanguageSelection rendering"); // Debug log
          return <LanguageSelection {...props} />;
        }}
      </Stack.Screen>
      <Stack.Screen name="EditProfile">
        {(props) => {
          console.log("EditProfile rendering"); // Debug log
          return <EditProfile {...props} />;
        }}
      </Stack.Screen>
      <Stack.Screen name="Achievements">
        {(props) => {
          console.log("Achievements rendering"); // Debug log
          return <Achievements {...props} />;
        }}
      </Stack.Screen>
      <Stack.Screen name="notificationeditor">
        {(props) => {
          console.log("NotificationEditor rendering"); // Debug log
          return <NotificationEditor {...props} />;
        }}
      </Stack.Screen>
      <Stack.Screen name="Theme">
        {(props) => {
          console.log("Theme rendering"); // Debug log
          return <Theme {...props} />;
        }}
      </Stack.Screen>
      <Stack.Screen name="contactus">
        {(props) => {
          console.log("ContactUs rendering"); // Debug log
          return <ContactUs {...props} />;
        }}
      </Stack.Screen>
      <Stack.Screen name="helpsupport">
        {(props) => {
          console.log("HelpSupport rendering"); // Debug log
          return <HelpSupport {...props} />;
        }}
      </Stack.Screen>
      <Stack.Screen name="securityprivacy">
        {(props) => {
          console.log("SecurityPrivacy rendering"); // Debug log
          return <SecurityPrivacy {...props} />;
        }}
      </Stack.Screen>
      <Stack.Screen name="YourEvents">
        {(props) => {
          console.log("YourEvents rendering"); // Debug log
          return <YourEvents {...props} />;
        }}
      </Stack.Screen>
      <Stack.Screen name="PrivacyPolicy">
        {(props) => {
          console.log("PrivacyPolicy rendering"); // Debug log
          return <PrivacyPolicy {...props} />;
        }}
      </Stack.Screen>
      <Stack.Screen name="EventLeaderboard">
        {(props) => {
          console.log("EventLeaderboard rendering"); // Debug log
          return <EventLeaderboard {...props} />;
        }}
      </Stack.Screen>
      <Stack.Screen name="LogRecordingScreen">
        {(props) => {
          console.log("LogRecordingScreen rendering"); // Debug log
          return <LogRecordingScreen {...props} />;
        }}
      </Stack.Screen>
      <Stack.Screen name="ActiveEvent">
        {(props) => {
          console.log("ActiveEvent rendering"); // Debug log
          return <ActiveEvent {...props} />;
        }}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

const App = () => {
  console.log("App rendering"); // Debug log
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <ThemeProvider>
          <EventProvider>
            <NavigationContainer>
              <AppContent />
            </NavigationContainer>
          </EventProvider>
        </ThemeProvider>
      </UserProvider>
    </GestureHandlerRootView>
  );
};

export default App;