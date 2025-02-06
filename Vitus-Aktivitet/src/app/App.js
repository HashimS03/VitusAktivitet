import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

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
import Notifications from "../components/notifications/notifications";  // ✅ Import Notifications
import LanguageSelection from "../components/Setting/language"; // ✅ Import the new screen


// Events and Event Management
import JoinEvent from "../components/events/JoinEvent";
import NewEvent from "../components/events/NewEvent";
import ActiveEventImproved from "../components/events/active-event";
import InviteMembersScreen from "../components/events/InviteMembersScreen";
import UpcommingEvents from "../components/events/upcomming-events";

// Step Counting and Activity Tracking
import StepCounter from "../components/stepcounter/stepcounter";
import ActivitySelect from "../components/stepconverter/activityselect";
import DurationSelect from "../components/stepconverter/durationselect";
import Confirmation from "../components/stepconverter/confirmation";

// User Selection Screens
import GenderSelection from "../components/genderselection/genderselection";
import DepartmentSelection from "../components/departmentselection/departmentselection";
import AvatarSelection from "../components/avatarselection/avatarselection";

// Create Navigators
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/** Events Stack - Handles event-related screens */
const EventsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="EventsMain" component={EventsNavigation} />
    <Stack.Screen name="JoinEvent" component={JoinEvent} />
    <Stack.Screen name="NewEvent" component={NewEvent} />
    <Stack.Screen name="ActiveEvent" component={ActiveEventImproved} />
    <Stack.Screen name="InviteMembers" component={InviteMembersScreen} />
  </Stack.Navigator>
);

/** Bottom Tab Navigator - Main App Navigation */
const TabNavigator = () => (
  <Tab.Navigator
    tabBar={(props) => <Navbar {...props} />}
    screenOptions={{
      headerShown: false,
    }}
  >
    <Tab.Screen name="Home" component={Dashboard} />
    <Tab.Screen name="Leaderboard" component={Leaderboard} />
    <Tab.Screen name="Events" component={EventsStack} />
  </Tab.Navigator>
);

/** Root Stack Navigator - Handles authentication & app navigation */
const App = ({ navigation }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Start"
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Authentication Screens */}
        <Stack.Screen name="Start" component={StartScreen} />
        <Stack.Screen name="Login">
          {(props) => (
            <LoginScreen
              {...props}
              onLoginSuccess={() =>
                props.navigation.reset({
                  index: 0,
                  routes: [{ name: "MainApp" }],
                })
              }
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="SignUp">
          {(props) => (
            <CreateAccountScreen
              {...props}
              onSignUpSuccess={() =>
                props.navigation.reset({
                  index: 0,
                  routes: [{ name: "MainApp" }],
                })
              }
            />
          )}
        </Stack.Screen>

        {/* Gender Selection */}
        <Stack.Screen name="GenderSelection">
          {(props) => (
            <GenderSelection
              {...props}
              onComplete={(gender) => console.log("Selected Gender:", gender)}
            />
          )}
        </Stack.Screen>
        {/* Department Selection */}
        <Stack.Screen name="DepartmentSelection">
          {(props) => (
            <DepartmentSelection
              {...props}
              onComplete={(department) =>
                console.log("Selected Department:", department)
              }
            />
          )}
        </Stack.Screen>
        {/* History */}
        <Stack.Screen name="History" component={HistoryScreen} />

        {/* Avatar Selection */}
        <Stack.Screen name="AvatarSelection" component={AvatarSelection} />

        {/* Main App (Tabs) */}
        <Stack.Screen name="MainApp" component={TabNavigator} />

        {/* Other Screens */}
        <Stack.Screen name="ActivitySelect" component={ActivitySelect} />
        <Stack.Screen name="DurationSelect" component={DurationSelect} />
        <Stack.Screen name="Confirmation" component={Confirmation} />
        <Stack.Screen name="Setting" component={Setting} />
        <Stack.Screen name="Stats" component={Stats} />
        <Stack.Screen name="Notifications" component={Notifications} /> 
        <Stack.Screen name="Language" component={LanguageSelection} /> 
 
      </Stack.Navigator>
    </NavigationContainer>
  );
};



export default App;
