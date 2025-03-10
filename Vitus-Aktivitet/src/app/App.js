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

// Import EventProvider
import { EventProvider } from "../components/events/EventContext"; // Pass på at stien er riktig

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
    <Stack.Screen name="ActiveEvent" component={ActiveEvent} />
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
const App = () => {
  return (
    <ThemeProvider>
      <EventProvider>
        {/* Wrap med EventProvider */}
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
                  onComplete={(gender) =>
                    console.log("Selected Gender:", gender)
                  }
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
            <Stack.Screen
              name="MainApp"
              component={TabNavigator}
              options={{
                gestureEnabled: false, // 🔒 Hindrer swipe tilbake fra Dashboard
              }}
            />

            {/* Other Screens */}
            <Stack.Screen name="ActivitySelect" component={ActivitySelect} />
            <Stack.Screen name="DurationSelect" component={DurationSelect} />
            <Stack.Screen name="Confirmation" component={Confirmation} />
            <Stack.Screen name="Setting" component={Setting} />
            <Stack.Screen name="Stats" component={Stats} />
            <Stack.Screen name="TrophyDetails" component={TrophyDetails} />
            <Stack.Screen name="Notifications" component={Notifications} />
            <Stack.Screen name="Language" component={LanguageSelection} />
            <Stack.Screen name="EditProfile" component={EditProfile} />

            <Stack.Screen name="Achievements" component={Achievements} />
            <Stack.Screen
              name="notificationeditor"
              component={NotificationEditor}
            />

            <Stack.Screen name="Theme" component={Theme} />
            <Stack.Screen name="contactus" component={ContactUs} />
            <Stack.Screen name="helpsupport" component={HelpSupport} />
            <Stack.Screen name="securityprivacy" component={SecurityPrivacy} />
            <Stack.Screen name="YourEvents" component={YourEvents} />

            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
            <Stack.Screen
              name="EventLeaderboard"
              component={EventLeaderboard}
            />
            <Stack.Screen
              name="LogRecordingScreen"
              component={LogRecordingScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </EventProvider>
    </ThemeProvider>
  );
};

export default App;
