import React, { useEffect, useState } from "react";
import * as NavigationBar from "expo-navigation-bar";
import {
  Alert,
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import LiveDriverMap, { type MapCoordinate } from "./LiveDriverMap";

type AppScreen =
  | "welcome"
  | "rewards"
  | "drivers"
  | "driverApplication"
  | "driverApplicationThankYou"
  | "pageFour"
  | "roleSelection"
  | "customerSignUp"
  | "driverSignUpCheckpoint"
  | "driverDistrictShiftCheckpoint"
  | "driverEarnings"
  | "driverTrips"
  | "driverAccount"
  | "signIn"
  | "forgotPassword"
  | "customerFareCheckpoint"
  | "rideBookedCheckpoint"
  | "driverTrackingCheckpoint"
  | "driverArrived"
  | "tripInProgressCheckpoint"
  | "tripCompleteCheckpoint"
  | "customerRideHistory"
  | "customerRewards"
  | "customerAccount"
  | "customerEditAccount"
  | "customerHelpCheckpoint"
  | "customerHome"
  | "driverHome";

type ImageFrame = {
  height: number;
  width: number;
  x: number;
  y: number;
};

type AccountRole = "customer" | "driver" | null;

type CustomerPaymentMethod = "card" | "";

type DriverApplication = {
  address: string;
  availabilityNotes: string;
  email: string;
  experience: string;
  fullName: string;
  licenceExpiry: string;
  licenceNumber: string;
  mobile: string;
  previousDrivingWork: string;
  vehicleColour: string;
  vehicleMake: string;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleYear: string;
  yearsDriving: string;
};

type ApplicationFieldProps = {
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  label: string;
  multiline?: boolean;
  onChangeText: (value: string) => void;
  value: string;
};

type DemoNavigationProps = {
  frame: ImageFrame;
  onBack?: () => void;
  onNext?: () => void;
};

type CustomerBottomNavigationProps = {
  current: AppScreen;
  frame: ImageFrame;
  onNavigate: (target: AppScreen) => void;
};

type DriverBottomNavigationProps = {
  current: AppScreen;
  onNavigate: (target: AppScreen) => void;
};

type DocumentKey =
  | "criminalCheck"
  | "driverAbstract"
  | "driverLicence"
  | "resume"
  | "vehicleRegistration";

const welcomeArtwork = require("./assets/welcome-approved.png");
const rewardsArtwork = require("./assets/rewards-approved-final.png");
const driversArtwork = require("./assets/drivers-approved-final.png");
const pageFourArtwork = require("./assets/page-4-approved.png");
const roleSelectionArtwork = require("./assets/role-selection-approved.png");
const signInArtwork = require("./assets/sign-in-approved.png");
const customerHomeArtwork = require("./assets/Let’s Go Ride Booking App.png");
const driverHomeArtwork = require("./assets/Neon Driver Home Dashboard.png");
const officialLogo = require("./assets/ok-lets-go-logo.png");
const fareEstimateArtwork = require("./assets/fare-estimate-approved.png");
const rideBookedArtwork = require("./assets/ride-booked-approved.png");
const driverTrackingArtwork = require("./assets/driver-tracking-approved.png");
const tripInProgressArtwork = require("./assets/trip-in-progress-approved.png");
const tripCompleteArtwork = require("./assets/trip-complete-approved.png");
const customerRideHistoryArtwork = require("./assets/customer-ride-history-approved.png");
const customerRewardsArtwork = require("./assets/customer-rewards-approved.png");
const customerAccountArtwork = require("./assets/customer-account-approved.png");

const districts = ["Toronto", "Waterloo", "Kitchener"];
const shifts = ["6 AM – 2 PM", "2 PM – 10 PM", "10 PM – 6 AM"];
const profileShiftOptions = [
  { label: "Day shift", time: "6 AM – 2 PM" },
  { label: "Evening shift", time: "2 PM – 10 PM" },
  { label: "Night shift", time: "10 PM – 6 AM" },
];
const documents: { key: DocumentKey; label: string }[] = [
  { key: "resume", label: "Resume / CV" },
  { key: "driverLicence", label: "Driver's Licence" },
  { key: "vehicleRegistration", label: "Vehicle Registration" },
  { key: "driverAbstract", label: "Driver Abstract / Record" },
  { key: "criminalCheck", label: "Criminal Record Check" },
];

const emptyApplication: DriverApplication = {
  address: "",
  availabilityNotes: "",
  email: "",
  experience: "",
  fullName: "",
  licenceExpiry: "",
  licenceNumber: "",
  mobile: "",
  previousDrivingWork: "",
  vehicleColour: "",
  vehicleMake: "",
  vehicleModel: "",
  vehiclePlate: "",
  vehicleYear: "",
  yearsDriving: "",
};

const passengerPickupCoordinate: MapCoordinate = {
  latitude: 43.65345,
  longitude: -79.3841,
};

const tripDestinationCoordinate: MapCoordinate = {
  latitude: 43.6453,
  longitude: -79.3806,
};

function getContainedFrame(
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number,
): ImageFrame {
  const imageRatio = imageWidth / imageHeight;
  const containerRatio = containerWidth / containerHeight;

  if (containerRatio > imageRatio) {
    const height = containerHeight;
    const width = height * imageRatio;
    return { height, width, x: (containerWidth - width) / 2, y: 0 };
  }

  const width = containerWidth;
  const height = width / imageRatio;
  return { height, width, x: 0, y: (containerHeight - height) / 2 };
}

function ApplicationField({
  keyboardType = "default",
  label,
  multiline = false,
  onChangeText,
  value,
}: ApplicationFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
        autoCorrect={keyboardType !== "email-address"}
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor="#7890AD"
        style={[styles.applicationInput, multiline && styles.multilineInput]}
        value={value}
      />
    </View>
  );
}

function DemoNavigation({ frame, onBack, onNext }: DemoNavigationProps) {
  return (
    <>
      {onBack && (
        <Pressable
          accessibilityLabel="Back"
          accessibilityRole="button"
          onPress={onBack}
          style={({ pressed }) => [
            styles.demoNavigationButton,
            {
              left: frame.x + frame.width * 0.025,
              top: frame.y + frame.height * 0.016,
              width: frame.width * 0.2,
              height: frame.height * 0.046,
            },
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.demoNavigationText}>BACK</Text>
        </Pressable>
      )}

      {onNext && (
        <Pressable
          accessibilityLabel="Next"
          accessibilityRole="button"
          onPress={onNext}
          style={({ pressed }) => [
            styles.demoNavigationButton,
            styles.demoNavigationNextButton,
            {
              left: frame.x + frame.width * 0.775,
              top: frame.y + frame.height * 0.016,
              width: frame.width * 0.2,
              height: frame.height * 0.046,
            },
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.demoNavigationText}>NEXT</Text>
          <Text style={styles.demoNavigationArrow}>→</Text>
        </Pressable>
      )}
    </>
  );
}

function CustomerBottomNavigation({
  current,
  frame,
  onNavigate,
}: CustomerBottomNavigationProps) {
  const items: { label: string; left: number; target: AppScreen }[] = [
    { label: "Book Ride", left: 0.022, target: "customerHome" },
    { label: "Ride History", left: 0.258, target: "customerRideHistory" },
    { label: "Rewards", left: 0.498, target: "customerRewards" },
    { label: "Account", left: 0.738, target: "customerAccount" },
  ];

  return (
    <>
      <Pressable
        accessibilityLabel="Back to Book Ride"
        accessibilityRole="button"
        onPress={() => onNavigate("customerHome")}
        style={({ pressed }) => [
          styles.customerSecondaryBackButton,
          {
            left: frame.x + frame.width * 0.025,
            top: frame.y + frame.height * 0.018,
            width: frame.width * 0.16,
            height: frame.height * 0.043,
          },
          pressed && styles.greenHotspotPressed,
        ]}
      >
        <Text style={styles.customerSecondaryBackText}>BACK</Text>
      </Pressable>

      {items.map((item) => (
        <Pressable
          accessibilityLabel={item.label}
          accessibilityRole="button"
          accessibilityState={{ selected: current === item.target }}
          key={item.label}
          onPress={() => {
            if (current === item.target) {
              Alert.alert(item.label, `You are viewing ${item.label}.`);
            } else {
              onNavigate(item.target);
            }
          }}
          style={({ pressed }) => [
            styles.customerBottomTab,
            {
              left: frame.x + frame.width * item.left,
              top: frame.y + frame.height * 0.906,
              width: frame.width * 0.238,
              height: frame.height * 0.082,
            },
            pressed && styles.blueHotspotPressed,
          ]}
        />
      ))}
    </>
  );
}

function DriverBottomNavigation({
  current,
  onNavigate,
}: DriverBottomNavigationProps) {
  const items: { label: string; target: AppScreen }[] = [
    { label: "Home", target: "driverHome" },
    { label: "Earnings", target: "driverEarnings" },
    { label: "Trips", target: "driverTrips" },
    { label: "Account", target: "driverAccount" },
  ];

  return (
    <View style={styles.driverBottomNavigation}>
      {items.map((item) => {
        const selected = current === item.target;
        return (
          <Pressable
            accessibilityLabel={item.label}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={item.label}
            onPress={() => onNavigate(item.target)}
            style={({ pressed }) => [
              styles.driverBottomTab,
              selected && styles.driverBottomTabSelected,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text
              style={[
                styles.driverBottomTabText,
                selected && styles.driverBottomTabTextSelected,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("driverArrived");
  const [application, setApplication] =
    useState<DriverApplication>(emptyApplication);
  const [district, setDistrict] = useState("");
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<
    Record<DocumentKey, boolean>
  >({
    criminalCheck: false,
    driverAbstract: false,
    driverLicence: false,
    resume: false,
    vehicleRegistration: false,
  });
  const [informationConfirmed, setInformationConfirmed] = useState(false);
  const [signInIdentifier, setSignInIdentifier] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetInstructionsSent, setResetInstructionsSent] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AccountRole>(null);
  const [customerFullName, setCustomerFullName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPaymentMethod, setCustomerPaymentMethod] =
    useState<CustomerPaymentMethod>("");
  const [driverFullName, setDriverFullName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [driverEmail, setDriverEmail] = useState("");
  const [driverPassword, setDriverPassword] = useState("");
  const [driverPasswordVisible, setDriverPasswordVisible] = useState(false);
  const [driverProfileDistrict, setDriverProfileDistrict] = useState("Toronto");
  const [driverProfileShifts, setDriverProfileShifts] = useState<string[]>([
    "6 AM – 2 PM",
  ]);
  const [accountFullName, setAccountFullName] = useState("Sarah M.");
  const [accountPhone, setAccountPhone] = useState("(519) 555-0123");
  const [accountEmail, setAccountEmail] = useState("sarah.m@example.com");
  const [accountPayment, setAccountPayment] = useState(
    "Mastercard •••• 4567",
  );
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const [standardSelected, setStandardSelected] = useState(true);
  const [driverOnline, setDriverOnline] = useState(true);
  const [driverPaused, setDriverPaused] = useState(false);
  const [driverEarningsPeriod, setDriverEarningsPeriod] = useState<
    "today" | "week"
  >("today");
  const [driverTripsFilter, setDriverTripsFilter] = useState<
    "completed" | "scheduled"
  >("completed");
  const [driverAccountFullName, setDriverAccountFullName] =
    useState("Demo Driver");
  const [driverAccountPhone, setDriverAccountPhone] =
    useState("(519) 555-0182");
  const [driverAccountEmail, setDriverAccountEmail] =
    useState("driver@example.com");
  const [driverVehicleMake, setDriverVehicleMake] = useState("Toyota");
  const [driverVehicleModel, setDriverVehicleModel] = useState("Camry");
  const [driverVehicleYear, setDriverVehicleYear] = useState("2022");
  const [driverVehicleColour, setDriverVehicleColour] = useState("Black");
  const [driverVehiclePlate, setDriverVehiclePlate] = useState("ABCD 123");
  const [customerNotice, setCustomerNotice] = useState("");
  const [selectedRating, setSelectedRating] = useState(5);
  const [selectedTip, setSelectedTip] = useState("$10");
  const [driverWaitSeconds, setDriverWaitSeconds] = useState(180);
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const canvasWidth = Math.min(windowWidth, 520);
  const driverFrame = getContainedFrame(canvasWidth, windowHeight, 941, 1672);
  const roleFrame = getContainedFrame(canvasWidth, windowHeight, 853, 1844);
  const signInFrame = getContainedFrame(canvasWidth, windowHeight, 941, 1672);
  const fareEstimateFrame = getContainedFrame(
    canvasWidth,
    windowHeight,
    864,
    1821,
  );
  const rideBookedFrame = getContainedFrame(
    canvasWidth,
    windowHeight,
    864,
    1821,
  );
  const driverTrackingFrame = getContainedFrame(
    canvasWidth,
    windowHeight,
    864,
    1821,
  );
  const tripInProgressFrame = getContainedFrame(
    canvasWidth,
    windowHeight,
    866,
    1817,
  );
  const tripCompleteFrame = getContainedFrame(
    canvasWidth,
    windowHeight,
    866,
    1816,
  );
  const customerSecondaryFrame = getContainedFrame(
    canvasWidth,
    windowHeight,
    864,
    1821,
  );
  const customerHomeFrame = getContainedFrame(
    canvasWidth,
    windowHeight,
    1024,
    1536,
  );
  const freeWaitSeconds = Math.max(0, driverWaitSeconds);
  const waitMinutes = Math.floor(freeWaitSeconds / 60)
    .toString()
    .padStart(2, "0");
  const waitSeconds = (freeWaitSeconds % 60).toString().padStart(2, "0");
  const chargedWaitMinutes =
    driverWaitSeconds < 0 ? Math.ceil(Math.abs(driverWaitSeconds) / 60) : 0;
  const currentWaitingCharge = chargedWaitMinutes * 0.5;

  useEffect(() => {
    const hideAndroidNavigation = async () => {
      try {
        await NavigationBar.setBehaviorAsync("overlay-swipe");
        await NavigationBar.setVisibilityAsync("hidden");
      } catch {
        // These calls safely do nothing on platforms without an Android bar.
      }
    };

    hideAndroidNavigation();
  }, []);

  useEffect(() => {
    if (screen !== "driverArrived") return undefined;

    setDriverWaitSeconds(180);
    const timer = setInterval(() => {
      setDriverWaitSeconds((current) => current - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [screen]);

  const updateApplication = (field: keyof DriverApplication, value: string) => {
    setApplication((current) => ({ ...current, [field]: value }));
  };

  const toggleShift = (shift: string) => {
    setSelectedShifts((current) =>
      current.includes(shift)
        ? current.filter((item) => item !== shift)
        : [...current, shift],
    );
  };

  const handleSignIn = () => {
    if (selectedRole === "driver") {
      setScreen("driverHome");
    } else if (selectedRole === "customer") {
      setScreen("customerHome");
    } else {
      setScreen("roleSelection");
    }
  };

  const openRoleSignIn = (role: Exclude<AccountRole, null>) => {
    setSelectedRole(role);
    setSignInIdentifier("");
    setSignInPassword("");
    setPasswordVisible(false);
    setScreen("signIn");
  };

  const openCustomerSignUp = () => {
    setCustomerFullName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setCustomerPaymentMethod("");
    setScreen("customerSignUp");
  };

  const openForgotPassword = () => {
    setResetIdentifier(signInIdentifier);
    setResetInstructionsSent(false);
    setScreen("forgotPassword");
  };

  const toggleDocument = (key: DocumentKey) => {
    setSelectedDocuments((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  if (screen === "driverApplicationThankYou") {
    return (
      <SafeAreaView style={styles.thankYouScreen}>
        <StatusBar hidden />

        <View style={styles.thankYouCard}>
          <Image
            accessibilityLabel="Official OK Let's Go logo"
            resizeMode="contain"
            source={officialLogo}
            style={styles.thankYouLogo}
          />

          <Text style={styles.thankYouTitle}>THANK YOU FOR APPLYING!</Text>
          <Text style={styles.thankYouBrand}>OK LET’S GO!</Text>
          <View style={styles.thankYouLine} />
          <Text style={styles.thankYouMessage}>
            We have received your driver application. Our team will review your
            information and get back to you soon.
          </Text>

          <Pressable
            accessibilityLabel="Return to the Driver Application"
            accessibilityRole="button"
            onPress={() => setScreen("driverApplication")}
            style={({ pressed }) => [
              styles.applicationBackButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.applicationButtonText}>BACK</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "driverApplication") {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar hidden />

        <View style={styles.phoneCanvas}>
          <ScrollView
            contentContainerStyle={styles.applicationContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Image
              accessibilityLabel="Official OK Let's Go logo"
              resizeMode="contain"
              source={officialLogo}
              style={styles.applicationLogo}
            />

            <Text style={styles.applicationTitle}>LET’S GET YOU DRIVING</Text>
            <Text style={styles.applicationSubtitle}>
              Complete your driver application for{" "}
              <Text style={styles.applicationBrand}>OK Let’s Go.</Text>
            </Text>
            <Text style={styles.demoNote}>
              Demo mode: every field is optional.
            </Text>

            <View style={styles.applicationSection}>
              <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
              <ApplicationField
                label="Full Name"
                onChangeText={(value) => updateApplication("fullName", value)}
                value={application.fullName}
              />
              <ApplicationField
                keyboardType="phone-pad"
                label="Mobile Number"
                onChangeText={(value) => updateApplication("mobile", value)}
                value={application.mobile}
              />
              <ApplicationField
                keyboardType="email-address"
                label="Email Address"
                onChangeText={(value) => updateApplication("email", value)}
                value={application.email}
              />
              <ApplicationField
                label="Home Address"
                onChangeText={(value) => updateApplication("address", value)}
                value={application.address}
              />

              <Text style={styles.fieldLabel}>District</Text>
              <View style={styles.choiceGrid}>
                {districts.map((item) => {
                  const selected = district === item;
                  return (
                    <Pressable
                      accessibilityLabel={`Select ${item} district`}
                      accessibilityRole="button"
                      key={item}
                      onPress={() => setDistrict(item)}
                      style={({ pressed }) => [
                        styles.choiceButton,
                        selected && styles.choiceButtonSelected,
                        pressed && styles.buttonPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.choiceButtonText,
                          selected && styles.choiceButtonTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.applicationSection}>
              <Text style={styles.sectionTitle}>DRIVING EXPERIENCE</Text>
              <ApplicationField
                keyboardType="numeric"
                label="Years of Driving Experience"
                onChangeText={(value) =>
                  updateApplication("yearsDriving", value)
                }
                value={application.yearsDriving}
              />
              <ApplicationField
                label="Previous Rideshare or Delivery Work"
                onChangeText={(value) =>
                  updateApplication("previousDrivingWork", value)
                }
                value={application.previousDrivingWork}
              />
              <ApplicationField
                label="Tell Us About Your Driving Experience"
                multiline
                onChangeText={(value) => updateApplication("experience", value)}
                value={application.experience}
              />
            </View>

            <View style={styles.applicationSection}>
              <Text style={styles.sectionTitle}>VEHICLE INFORMATION</Text>
              <View style={styles.twoColumnRow}>
                <View style={styles.halfField}>
                  <ApplicationField
                    keyboardType="numeric"
                    label="Vehicle Year"
                    onChangeText={(value) =>
                      updateApplication("vehicleYear", value)
                    }
                    value={application.vehicleYear}
                  />
                </View>
                <View style={styles.halfField}>
                  <ApplicationField
                    label="Vehicle Colour"
                    onChangeText={(value) =>
                      updateApplication("vehicleColour", value)
                    }
                    value={application.vehicleColour}
                  />
                </View>
              </View>
              <ApplicationField
                label="Vehicle Make"
                onChangeText={(value) =>
                  updateApplication("vehicleMake", value)
                }
                value={application.vehicleMake}
              />
              <ApplicationField
                label="Vehicle Model"
                onChangeText={(value) =>
                  updateApplication("vehicleModel", value)
                }
                value={application.vehicleModel}
              />
              <ApplicationField
                label="Licence Plate"
                onChangeText={(value) =>
                  updateApplication("vehiclePlate", value)
                }
                value={application.vehiclePlate}
              />
            </View>

            <View style={styles.applicationSection}>
              <Text style={styles.sectionTitle}>LICENCE AND DOCUMENTS</Text>
              <ApplicationField
                label="Driver's Licence Number"
                onChangeText={(value) =>
                  updateApplication("licenceNumber", value)
                }
                value={application.licenceNumber}
              />
              <ApplicationField
                label="Licence Expiry Date"
                onChangeText={(value) =>
                  updateApplication("licenceExpiry", value)
                }
                value={application.licenceExpiry}
              />

              <Text style={styles.fieldLabel}>Documents</Text>
              {documents.map((document) => {
                const selected = selectedDocuments[document.key];
                return (
                  <Pressable
                    accessibilityLabel={`${
                      selected ? "Remove" : "Add"
                    } ${document.label}`}
                    accessibilityRole="button"
                    key={document.key}
                    onPress={() => toggleDocument(document.key)}
                    style={({ pressed }) => [
                      styles.documentButton,
                      selected && styles.documentButtonSelected,
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <Text style={styles.documentName}>{document.label}</Text>
                    <Text
                      style={[
                        styles.documentAction,
                        selected && styles.documentActionSelected,
                      ]}
                    >
                      {selected ? "SELECTED" : "ADD DOCUMENT"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.applicationSection}>
              <Text style={styles.sectionTitle}>AVAILABILITY</Text>
              <Text style={styles.fieldLabel}>Preferred Shift(s)</Text>
              <View style={styles.choiceGrid}>
                {shifts.map((shift) => {
                  const selected = selectedShifts.includes(shift);
                  return (
                    <Pressable
                      accessibilityLabel={`${
                        selected ? "Remove" : "Select"
                      } ${shift} shift`}
                      accessibilityRole="button"
                      key={shift}
                      onPress={() => toggleShift(shift)}
                      style={({ pressed }) => [
                        styles.shiftButton,
                        selected && styles.choiceButtonSelected,
                        pressed && styles.buttonPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.choiceButtonText,
                          selected && styles.choiceButtonTextSelected,
                        ]}
                      >
                        {shift}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <ApplicationField
                label="Availability Notes"
                multiline
                onChangeText={(value) =>
                  updateApplication("availabilityNotes", value)
                }
                value={application.availabilityNotes}
              />
            </View>

            <Pressable
              accessibilityLabel="Confirm application information"
              accessibilityRole="checkbox"
              accessibilityState={{ checked: informationConfirmed }}
              onPress={() => setInformationConfirmed((current) => !current)}
              style={({ pressed }) => [
                styles.confirmationRow,
                pressed && styles.buttonPressed,
              ]}
            >
              <View
                style={[
                  styles.checkbox,
                  informationConfirmed && styles.checkboxSelected,
                ]}
              >
                {informationConfirmed && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={styles.confirmationText}>
                I confirm that the information in this application is accurate.
              </Text>
            </Pressable>

            <View style={styles.applicationNavigation}>
              <Pressable
                accessibilityLabel="Return to the Drivers Wanted page"
                accessibilityRole="button"
                onPress={() => setScreen("drivers")}
                style={({ pressed }) => [
                  styles.applicationBackButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.applicationButtonText}>BACK</Text>
              </Pressable>

              <Pressable
                accessibilityLabel="Submit driver application"
                accessibilityRole="button"
                onPress={() => setScreen("driverApplicationThankYou")}
                style={({ pressed }) => [
                  styles.applicationNextButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.applicationButtonText}>NEXT</Text>
                <Text style={styles.applicationNextArrow}>→</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "forgotPassword") {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar hidden />
        <View style={styles.phoneCanvas}>
          <ScrollView
            contentContainerStyle={styles.forgotPasswordContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.forgotPasswordTopRow}>
              <Pressable
                accessibilityLabel="Return to Sign In"
                accessibilityRole="button"
                onPress={() => setScreen("signIn")}
                style={({ pressed }) => [
                  styles.forgotPasswordBackButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.forgotPasswordBackText}>BACK</Text>
              </Pressable>
            </View>

            <Image
              accessibilityLabel="Official OK Let's Go logo"
              resizeMode="contain"
              source={officialLogo}
              style={styles.forgotPasswordLogo}
            />

            <Text style={styles.forgotPasswordTitle}>FORGOT</Text>
            <Text style={styles.forgotPasswordTitleOrange}>PASSWORD?</Text>
            <Text style={styles.forgotPasswordSubtitle}>
              Enter your email or mobile number and{" "}
              <Text style={styles.forgotPasswordSubtitleBrand}>
                OK Let’s Go
              </Text>{" "}
              will send reset instructions.
            </Text>

            <View style={styles.forgotPasswordCard}>
              <Text style={styles.forgotPasswordFieldLabel}>
                EMAIL OR MOBILE NUMBER
              </Text>
              <TextInput
                accessibilityLabel="Email or mobile number for password reset"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={(value) => {
                  setResetIdentifier(value);
                  setResetInstructionsSent(false);
                }}
                placeholder="Enter your email or mobile number"
                placeholderTextColor="#7890AD"
                style={styles.forgotPasswordInput}
                value={resetIdentifier}
              />

              <Pressable
                accessibilityLabel="Send reset instructions"
                accessibilityRole="button"
                onPress={() => setResetInstructionsSent(true)}
                style={({ pressed }) => [
                  styles.forgotPasswordSendButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.forgotPasswordSendText}>
                  SEND RESET INSTRUCTIONS
                </Text>
              </Pressable>

              {resetInstructionsSent && (
                <View
                  accessibilityLiveRegion="polite"
                  style={styles.forgotPasswordConfirmation}
                >
                  <Text style={styles.forgotPasswordConfirmationTitle}>
                    INSTRUCTIONS SENT
                  </Text>
                  <Text style={styles.forgotPasswordConfirmationText}>
                    If an account matches, password reset instructions are on
                    the way.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "customerSignUp") {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar hidden />
        <View style={styles.phoneCanvas}>
          <ScrollView
            contentContainerStyle={styles.customerSignUpContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.customerSignUpTopRow}>
              <Pressable
                accessibilityLabel="Return to Customer Sign In"
                accessibilityRole="button"
                onPress={() => setScreen("signIn")}
                style={({ pressed }) => [
                  styles.customerSignUpBackButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.customerSignUpBackText}>BACK</Text>
              </Pressable>
            </View>

            <Image
              accessibilityLabel="Official OK Let's Go logo"
              resizeMode="contain"
              source={officialLogo}
              style={styles.customerSignUpLogo}
            />

            <Text style={styles.customerSignUpTitle}>CREATE YOUR</Text>
            <Text style={styles.customerSignUpTitleOrange}>
              CUSTOMER ACCOUNT
            </Text>
            <Text style={styles.customerSignUpSubtitle}>
              Enter your details to get moving with{" "}
              <Text style={styles.customerSignUpSubtitleBrand}>
                OK Let’s Go.
              </Text>
            </Text>

            <View style={styles.customerSignUpCard}>
              <Text style={styles.customerSignUpFieldLabel}>FULL NAME</Text>
              <TextInput
                accessibilityLabel="Full Name"
                autoCapitalize="words"
                onChangeText={setCustomerFullName}
                placeholder="Enter your full name"
                placeholderTextColor="#7890AD"
                style={styles.customerSignUpInput}
                value={customerFullName}
              />

              <Text style={styles.customerSignUpFieldLabel}>PHONE</Text>
              <TextInput
                accessibilityLabel="Phone"
                keyboardType="phone-pad"
                onChangeText={setCustomerPhone}
                placeholder="Enter your phone number"
                placeholderTextColor="#7890AD"
                style={styles.customerSignUpInput}
                value={customerPhone}
              />

              <Text style={styles.customerSignUpFieldLabel}>EMAIL</Text>
              <TextInput
                accessibilityLabel="Email"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={setCustomerEmail}
                placeholder="Enter your email address"
                placeholderTextColor="#7890AD"
                style={styles.customerSignUpInput}
                value={customerEmail}
              />

              <Text style={styles.customerSignUpFieldLabel}>
                PAYMENT METHOD
              </Text>
              <View style={styles.customerPaymentRow}>
                <Pressable
                  accessibilityLabel="Select Credit or Debit Card"
                  accessibilityRole="button"
                  accessibilityState={{
                    selected: customerPaymentMethod === "card",
                  }}
                  onPress={() => setCustomerPaymentMethod("card")}
                  style={({ pressed }) => [
                    styles.customerPaymentButton,
                    customerPaymentMethod === "card" &&
                      styles.customerPaymentButtonSelected,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.customerPaymentText,
                      customerPaymentMethod === "card" &&
                        styles.customerPaymentTextSelected,
                    ]}
                  >
                    CREDIT / DEBIT CARD
                  </Text>
                </Pressable>
              </View>
            </View>

            <Pressable
              accessibilityLabel="Create Customer Account and continue"
              accessibilityRole="button"
              onPress={() => setScreen("customerHome")}
              style={({ pressed }) => [
                styles.customerSignUpContinueButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.customerSignUpContinueText}>CONTINUE</Text>
              <Text style={styles.customerSignUpContinueArrow}>→</Text>
            </Pressable>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "customerHome") {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar hidden />
        <View style={styles.phoneCanvas}>
          <Image
            accessibilityLabel="Customer Home and Book Ride"
            resizeMode="contain"
            source={customerHomeArtwork}
            style={{
              position: "absolute",
              left: customerHomeFrame.x,
              top: customerHomeFrame.y,
              width: customerHomeFrame.width,
              height: customerHomeFrame.height,
            }}
          />

          <Pressable
            accessibilityLabel="Return to Sign In"
            accessibilityRole="button"
            onPress={() => setScreen("signIn")}
            style={({ pressed }) => [
              styles.signInBackButton,
              {
                left: customerHomeFrame.x + customerHomeFrame.width * 0.018,
                top: customerHomeFrame.y + customerHomeFrame.height * 0.016,
              },
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.signInBackText}>BACK</Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Help"
            accessibilityRole="button"
            onPress={() => setScreen("customerHelpCheckpoint")}
            style={[
              styles.homeHotspot,
              {
                left: customerHomeFrame.x + customerHomeFrame.width * 0.88,
                top: customerHomeFrame.y + customerHomeFrame.height * 0.012,
                width: customerHomeFrame.width * 0.1,
                height: customerHomeFrame.height * 0.08,
              },
            ]}
          />

          {customerNotice !== "" && (
            <View
              style={[
                styles.customerNotice,
                {
                  left: customerHomeFrame.x + customerHomeFrame.width * 0.25,
                  top: customerHomeFrame.y + customerHomeFrame.height * 0.385,
                  width: customerHomeFrame.width * 0.5,
                },
              ]}
            >
              <Text style={styles.customerNoticeText}>{customerNotice}</Text>
            </View>
          )}

          <TextInput
            accessibilityLabel="Pickup location"
            onChangeText={setPickup}
            placeholder="Enter pickup location"
            placeholderTextColor="#FFFFFF"
            style={[
              styles.customerHomeInput,
              {
                left: customerHomeFrame.x + customerHomeFrame.width * 0.17,
                top: customerHomeFrame.y + customerHomeFrame.height * 0.46,
                width: customerHomeFrame.width * 0.66,
                height: customerHomeFrame.height * 0.05,
              },
            ]}
            value={pickup}
          />

          <TextInput
            accessibilityLabel="Destination"
            onChangeText={setDestination}
            placeholder="Where are you going?"
            placeholderTextColor="#FFFFFF"
            style={[
              styles.customerHomeInput,
              {
                left: customerHomeFrame.x + customerHomeFrame.width * 0.17,
                top: customerHomeFrame.y + customerHomeFrame.height * 0.54,
                width: customerHomeFrame.width * 0.66,
                height: customerHomeFrame.height * 0.05,
              },
            ]}
            value={destination}
          />

          <Pressable
            accessibilityLabel="Use my current location"
            accessibilityRole="button"
            accessibilityState={{ selected: useCurrentLocation }}
            onPress={() => {
              const nextValue = !useCurrentLocation;
              setUseCurrentLocation(nextValue);
              if (nextValue && pickup.trim() === "")
                setPickup("Current location");
              if (!nextValue && pickup === "Current location") setPickup("");
            }}
            style={[
              styles.homeHotspot,
              {
                left: customerHomeFrame.x + customerHomeFrame.width * 0.06,
                top: customerHomeFrame.y + customerHomeFrame.height * 0.59,
                width: customerHomeFrame.width * 0.88,
                height: customerHomeFrame.height * 0.07,
              },
            ]}
          >
            {useCurrentLocation && (
              <View style={styles.homeGreenIndicator}>
                <Text style={styles.homeIndicatorText}>ON</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            accessibilityLabel="Schedule for later"
            accessibilityRole="button"
            accessibilityState={{ selected: scheduled }}
            onPress={() => setScheduled((current) => !current)}
            style={[
              styles.homeHotspot,
              {
                left: customerHomeFrame.x + customerHomeFrame.width * 0.06,
                top: customerHomeFrame.y + customerHomeFrame.height * 0.66,
                width: customerHomeFrame.width * 0.88,
                height: customerHomeFrame.height * 0.07,
              },
            ]}
          >
            {scheduled && (
              <View style={styles.homeGreenIndicator}>
                <Text style={styles.homeIndicatorText}>ON</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            accessibilityLabel="Standard ride"
            accessibilityRole="button"
            accessibilityState={{ selected: standardSelected }}
            onPress={() => setStandardSelected((current) => !current)}
            style={[
              styles.homeHotspot,
              {
                left: customerHomeFrame.x + customerHomeFrame.width * 0.06,
                top: customerHomeFrame.y + customerHomeFrame.height * 0.73,
                width: customerHomeFrame.width * 0.88,
                height: customerHomeFrame.height * 0.07,
              },
            ]}
          >
            {standardSelected && (
              <View style={styles.homeGreenIndicator}>
                <Text style={styles.homeIndicatorText}>SELECTED</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            accessibilityLabel="Get fare"
            accessibilityRole="button"
            onPress={() => setScreen("customerFareCheckpoint")}
            style={[
              styles.homeHotspot,
              {
                left: customerHomeFrame.x + customerHomeFrame.width * 0.05,
                top: customerHomeFrame.y + customerHomeFrame.height * 0.81,
                width: customerHomeFrame.width * 0.9,
                height: customerHomeFrame.height * 0.09,
              },
            ]}
          />

          {[
            ["Book Ride", 0.02, "customerHome"],
            ["Ride History", 0.26, "customerRideHistory"],
            ["Rewards", 0.5, "customerRewards"],
            ["Account", 0.74, "customerAccount"],
          ].map(([label, left, target]) => (
            <Pressable
              accessibilityLabel={String(label)}
              accessibilityRole="button"
              key={String(label)}
              onPress={() => {
                if (target === "customerHome") {
                  setCustomerNotice("BOOK RIDE IS OPEN");
                } else {
                  setScreen(target as AppScreen);
                }
              }}
              style={[
                styles.homeHotspot,
                {
                  left:
                    customerHomeFrame.x +
                    customerHomeFrame.width * Number(left),
                  top: customerHomeFrame.y + customerHomeFrame.height * 0.918,
                  width: customerHomeFrame.width * 0.24,
                  height: customerHomeFrame.height * 0.081,
                },
              ]}
            />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "customerRideHistory") {
    const rideDetails = [
      {
        label: "View upcoming ride details",
        message:
          "Scheduled for Aug 28 at 10:30 AM, from 200 University Ave W, Waterloo to Toronto Pearson Airport.",
        top: 0.419,
      },
      {
        label: "View completed ride details",
        message:
          "Completed Aug 24 at 8:15 PM, from 123 King St W to 50 Harbour St. Fare: $24.75. Driver: Marcus.",
        top: 0.638,
      },
      {
        label: "View cancelled ride details",
        message:
          "Cancelled Aug 21 at 4:40 PM, from 75 King St W, Kitchener to 200 Front St W, Toronto.",
        top: 0.846,
      },
    ];

    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar hidden />
        <View style={styles.phoneCanvas}>
          <Image
            accessibilityLabel="OK Let's Go Ride History"
            resizeMode="contain"
            source={customerRideHistoryArtwork}
            style={{
              position: "absolute",
              left: customerSecondaryFrame.x,
              top: customerSecondaryFrame.y,
              width: customerSecondaryFrame.width,
              height: customerSecondaryFrame.height,
            }}
          />

          {rideDetails.map((ride) => (
            <Pressable
              accessibilityLabel={ride.label}
              accessibilityRole="button"
              key={ride.label}
              onPress={() => Alert.alert("Ride Details", ride.message)}
              style={({ pressed }) => [
                styles.customerSecondaryHotspot,
                {
                  left:
                    customerSecondaryFrame.x +
                    customerSecondaryFrame.width * 0.132,
                  top:
                    customerSecondaryFrame.y +
                    customerSecondaryFrame.height * ride.top,
                  width: customerSecondaryFrame.width * 0.736,
                  height: customerSecondaryFrame.height * 0.043,
                },
                pressed && styles.greenHotspotPressed,
              ]}
            />
          ))}

          <CustomerBottomNavigation
            current="customerRideHistory"
            frame={customerSecondaryFrame}
            onNavigate={setScreen}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "customerRewards") {
    const rewardCards = [
      {
        label: "Points balance",
        message: "Your current rewards balance is 150 points.",
        left: 0.1,
        top: 0.247,
        width: 0.8,
        height: 0.148,
      },
      {
        label: "Rewards progress",
        message: "Keep riding to unlock your next reward.",
        left: 0.1,
        top: 0.404,
        width: 0.8,
        height: 0.095,
      },
      {
        label: "Recent rewards activity",
        message: "Trip completed Aug 24, 2026: 150 points earned.",
        left: 0.1,
        top: 0.506,
        width: 0.8,
        height: 0.098,
      },
      {
        label: "Earn points",
        message: "Every completed ride earns points.",
        left: 0.1,
        top: 0.612,
        width: 0.39,
        height: 0.147,
      },
      {
        label: "Unlock rewards",
        message: "Reach milestones to unlock rewards.",
        left: 0.51,
        top: 0.612,
        width: 0.39,
        height: 0.147,
      },
      {
        label: "Exclusive offers",
        message: "Your special offers will appear here.",
        left: 0.1,
        top: 0.766,
        width: 0.39,
        height: 0.147,
      },
      {
        label: "Free rides",
        message: "Eligible rewards can be redeemed for free rides.",
        left: 0.51,
        top: 0.766,
        width: 0.39,
        height: 0.147,
      },
    ];

    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar hidden />
        <View style={styles.phoneCanvas}>
          <Image
            accessibilityLabel="OK Let's Go Customer Rewards"
            resizeMode="contain"
            source={customerRewardsArtwork}
            style={{
              position: "absolute",
              left: customerSecondaryFrame.x,
              top: customerSecondaryFrame.y,
              width: customerSecondaryFrame.width,
              height: customerSecondaryFrame.height,
            }}
          />

          {rewardCards.map((card) => (
            <Pressable
              accessibilityLabel={card.label}
              accessibilityRole="button"
              key={card.label}
              onPress={() => Alert.alert(card.label, card.message)}
              style={({ pressed }) => [
                styles.customerSecondaryHotspot,
                {
                  left:
                    customerSecondaryFrame.x +
                    customerSecondaryFrame.width * card.left,
                  top:
                    customerSecondaryFrame.y +
                    customerSecondaryFrame.height * card.top,
                  width: customerSecondaryFrame.width * card.width,
                  height: customerSecondaryFrame.height * card.height,
                },
                pressed && styles.blueHotspotPressed,
              ]}
            />
          ))}

          <CustomerBottomNavigation
            current="customerRewards"
            frame={customerSecondaryFrame}
            onNavigate={setScreen}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "customerAccount") {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar hidden />
        <View style={styles.phoneCanvas}>
          <Image
            accessibilityLabel="OK Let's Go Customer Account"
            resizeMode="contain"
            source={customerAccountArtwork}
            style={{
              position: "absolute",
              left: customerSecondaryFrame.x,
              top: customerSecondaryFrame.y,
              width: customerSecondaryFrame.width,
              height: customerSecondaryFrame.height,
            }}
          />

          <Pressable
            accessibilityLabel="Open payment method"
            accessibilityRole="button"
            onPress={() => setScreen("customerEditAccount")}
            style={({ pressed }) => [
              styles.customerSecondaryHotspot,
              {
                left:
                  customerSecondaryFrame.x +
                  customerSecondaryFrame.width * 0.088,
                top:
                  customerSecondaryFrame.y +
                  customerSecondaryFrame.height * 0.604,
                width: customerSecondaryFrame.width * 0.824,
                height: customerSecondaryFrame.height * 0.098,
              },
              pressed && styles.blueHotspotPressed,
            ]}
          />

          <Pressable
            accessibilityLabel="Edit account information"
            accessibilityRole="button"
            onPress={() => setScreen("customerEditAccount")}
            style={({ pressed }) => [
              styles.customerSecondaryHotspot,
              {
                left:
                  customerSecondaryFrame.x +
                  customerSecondaryFrame.width * 0.088,
                top:
                  customerSecondaryFrame.y +
                  customerSecondaryFrame.height * 0.716,
                width: customerSecondaryFrame.width * 0.824,
                height: customerSecondaryFrame.height * 0.079,
              },
              pressed && styles.greenHotspotPressed,
            ]}
          />

          <Pressable
            accessibilityLabel="Sign out"
            accessibilityRole="button"
            onPress={() => {
              setSelectedRole(null);
              setSignInIdentifier("");
              setSignInPassword("");
              Alert.alert("Signed Out", "You have been signed out.");
              setScreen("roleSelection");
            }}
            style={({ pressed }) => [
              styles.customerSecondaryHotspot,
              {
                left:
                  customerSecondaryFrame.x +
                  customerSecondaryFrame.width * 0.088,
                top:
                  customerSecondaryFrame.y +
                  customerSecondaryFrame.height * 0.805,
                width: customerSecondaryFrame.width * 0.824,
                height: customerSecondaryFrame.height * 0.077,
              },
              pressed && styles.redHotspotPressed,
            ]}
          />

          <CustomerBottomNavigation
            current="customerAccount"
            frame={customerSecondaryFrame}
            onNavigate={setScreen}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "customerEditAccount") {
    return (
      <SafeAreaView style={styles.accountEditScreen}>
        <StatusBar hidden />
        <ScrollView
          contentContainerStyle={styles.accountEditContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.accountEditTopRow}>
            <Pressable
              accessibilityLabel="Back to My Account"
              accessibilityRole="button"
              onPress={() => setScreen("customerAccount")}
              style={({ pressed }) => [
                styles.accountEditBackButton,
                pressed && styles.greenHotspotPressed,
              ]}
            >
              <Text style={styles.accountEditBackText}>BACK</Text>
            </Pressable>
          </View>

          <Image
            accessibilityLabel="Official OK Let's Go logo"
            resizeMode="contain"
            source={officialLogo}
            style={styles.accountEditLogo}
          />

          <Text style={styles.accountEditTitle}>EDIT ACCOUNT</Text>
          <Text style={styles.accountEditSubtitle}>INFORMATION</Text>

          <View style={styles.accountEditCard}>
            <Text style={styles.accountEditLabel}>FULL NAME</Text>
            <TextInput
              accessibilityLabel="Full name"
              autoCapitalize="words"
              onChangeText={setAccountFullName}
              placeholder="Enter your full name"
              placeholderTextColor="#7890AD"
              style={styles.accountEditInput}
              value={accountFullName}
            />

            <Text style={styles.accountEditLabel}>MOBILE NUMBER</Text>
            <TextInput
              accessibilityLabel="Mobile number"
              keyboardType="phone-pad"
              onChangeText={setAccountPhone}
              placeholder="Enter your mobile number"
              placeholderTextColor="#7890AD"
              style={styles.accountEditInput}
              value={accountPhone}
            />

            <Text style={styles.accountEditLabel}>EMAIL ADDRESS</Text>
            <TextInput
              accessibilityLabel="Email address"
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setAccountEmail}
              placeholder="Enter your email address"
              placeholderTextColor="#7890AD"
              style={styles.accountEditInput}
              value={accountEmail}
            />

            <Text style={styles.accountEditLabel}>PAYMENT METHOD</Text>
            <TextInput
              accessibilityLabel="Payment method"
              onChangeText={setAccountPayment}
              placeholder="Enter your payment method"
              placeholderTextColor="#7890AD"
              style={styles.accountEditInput}
              value={accountPayment}
            />
          </View>

          <Pressable
            accessibilityLabel="Save account information"
            accessibilityRole="button"
            onPress={() => {
              Alert.alert(
                "Account Updated",
                "Your account information has been saved.",
              );
              setScreen("customerAccount");
            }}
            style={({ pressed }) => [
              styles.accountEditSaveButton,
              pressed && styles.greenHotspotPressed,
            ]}
          >
            <Text style={styles.accountEditSaveText}>SAVE INFORMATION</Text>
            <Text style={styles.accountEditSaveArrow}>→</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === "driverHome") {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar hidden />
        <View style={styles.phoneCanvas}>
          <Image
            accessibilityLabel="Driver Home dashboard"
            resizeMode="contain"
            source={driverHomeArtwork}
            style={{
              position: "absolute",
              left: driverFrame.x,
              top: driverFrame.y,
              width: driverFrame.width,
              height: driverFrame.height,
            }}
          />

          {driverOnline && !driverPaused && (
            <View style={styles.demoRideOfferCard}>
              <Text style={styles.demoRideOfferEyebrow}>NEW RIDE OFFER</Text>
              <Text style={styles.demoRideOfferTitle}>Marcus D.</Text>
              <Text style={styles.demoRideOfferAddress} numberOfLines={1}>
                Pickup: 100 Queen Street West
              </Text>
              <Text style={styles.demoRideOfferAddress} numberOfLines={1}>
                Destination: Union Station
              </Text>

              <View style={styles.demoRideOfferDetails}>
                <Text style={styles.demoRideOfferDetailText}>4 min away</Text>
                <Text style={styles.demoRideOfferDetailText}>1.2 km</Text>
                <Text style={styles.demoRideOfferFare}>$14.80</Text>
              </View>

              <Pressable
                accessibilityLabel="Accept ride offer"
                accessibilityRole="button"
                onPress={() => setScreen("driverTrackingCheckpoint")}
                style={({ pressed }) => [
                  styles.demoRideOfferAccept,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.demoRideOfferAcceptText}>ACCEPT RIDE</Text>
              </Pressable>
            </View>
          )}

          <DemoNavigation
            frame={driverFrame}
            onBack={() => setScreen("signIn")}
          />

          <Pressable
            accessibilityLabel="Go online or offline"
            accessibilityRole="switch"
            accessibilityState={{ checked: driverOnline }}
            onPress={() => setDriverOnline((current) => !current)}
            style={[
              styles.homeHotspot,
              {
                left: driverFrame.x + driverFrame.width * 0.09,
                top: driverFrame.y + driverFrame.height * 0.41,
                width: driverFrame.width * 0.39,
                height: driverFrame.height * 0.07,
              },
            ]}
          >
            {!driverOnline && (
              <View style={styles.homeRedIndicator}>
                <Text style={styles.homeIndicatorText}>OFFLINE</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            accessibilityLabel="Pause ride offers"
            accessibilityRole="switch"
            accessibilityState={{ checked: driverPaused }}
            onPress={() => setDriverPaused((current) => !current)}
            style={[
              styles.homeHotspot,
              {
                left: driverFrame.x + driverFrame.width * 0.51,
                top: driverFrame.y + driverFrame.height * 0.41,
                width: driverFrame.width * 0.4,
                height: driverFrame.height * 0.07,
              },
            ]}
          >
            {driverPaused && (
              <View style={styles.homeRedIndicator}>
                <Text style={styles.homeIndicatorText}>PAUSED</Text>
              </View>
            )}
          </Pressable>

          {[
            ["Rating", 0.06, 0.49, 0.28, 0.09, "Current driver rating: 4.9"],
            ["Trips", 0.36, 0.49, 0.28, 0.09, "128 completed trips."],
            ["Acceptance", 0.66, 0.49, 0.28, 0.09, "Acceptance rate: 96%."],
            ["Earnings", 0.06, 0.59, 0.88, 0.12, "Today's earnings: $186.40"],
            [
              "Ride Offers",
              0.06,
              0.72,
              0.88,
              0.16,
              "Waiting for new ride requests.",
            ],
          ].map(([label, left, top, width, height, message]) => (
            <Pressable
              accessibilityLabel={String(label)}
              accessibilityRole="button"
              key={String(label)}
              onPress={() => {
                if (String(label) === "Ride Offers") {
                  setScreen("driverArrived");
                  return;
                }
                Alert.alert(String(label), String(message));
              }}
              style={[
                styles.homeHotspot,
                {
                  left: driverFrame.x + driverFrame.width * Number(left),
                  top: driverFrame.y + driverFrame.height * Number(top),
                  width: driverFrame.width * Number(width),
                  height: driverFrame.height * Number(height),
                },
              ]}
            />
          ))}

          {[
            ["Home", 0.07, "driverHome"],
            ["Earnings", 0.29, "driverEarnings"],
            ["Trips", 0.51, "driverTrips"],
            ["Account", 0.73, "driverAccount"],
          ].map(([label, left, target]) => (
            <Pressable
              accessibilityLabel={String(label)}
              accessibilityRole="button"
              key={`driver-${String(label)}`}
              onPress={() => setScreen(String(target) as AppScreen)}
              style={[
                styles.homeHotspot,
                {
                  left: driverFrame.x + driverFrame.width * Number(left),
                  top: driverFrame.y + driverFrame.height * 0.89,
                  width: driverFrame.width * 0.21,
                  height: driverFrame.height * 0.08,
                },
              ]}
            />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "driverEarnings") {
    const earnings =
      driverEarningsPeriod === "today"
        ? {
            amount: "$186.40",
            label: "TODAY'S EARNINGS",
            onlineTime: "7 h 20 m",
            tips: "$22.00",
            tripFares: "$164.40",
            trips: "8",
          }
        : {
            amount: "$842.75",
            label: "THIS WEEK'S EARNINGS",
            onlineTime: "34 h 10 m",
            tips: "$81.00",
            tripFares: "$761.75",
            trips: "37",
          };

    return (
      <SafeAreaView style={styles.driverSecondaryScreen}>
        <StatusBar hidden />
        <ScrollView
          contentContainerStyle={styles.driverSecondaryContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.driverSecondaryTitle}>DRIVER EARNINGS</Text>
          <Text style={styles.driverSecondarySubtitle}>
            Your earnings at a glance.
          </Text>

          <View style={styles.driverSegmentRow}>
            {[
              { key: "today" as const, label: "TODAY" },
              { key: "week" as const, label: "THIS WEEK" },
            ].map((item) => {
              const selected = driverEarningsPeriod === item.key;
              return (
                <Pressable
                  accessibilityLabel={`Show ${item.label.toLowerCase()} earnings`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={item.key}
                  onPress={() => setDriverEarningsPeriod(item.key)}
                  style={({ pressed }) => [
                    styles.driverSegmentButton,
                    selected && styles.driverSegmentButtonSelectedOrange,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.driverSegmentText,
                      selected && styles.driverSegmentTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.driverEarningsHero}>
            <Text style={styles.driverEarningsHeroLabel}>{earnings.label}</Text>
            <Text style={styles.driverEarningsAmount}>{earnings.amount}</Text>
            <Text style={styles.driverEarningsPayout}>
              Payouts are processed daily.
            </Text>
          </View>

          <View style={styles.driverStatRow}>
            <View style={styles.driverStatCard}>
              <Text style={styles.driverStatLabel}>Completed trips</Text>
              <Text style={styles.driverStatValue}>{earnings.trips}</Text>
            </View>
            <View style={styles.driverStatCard}>
              <Text style={styles.driverStatLabel}>Online time</Text>
              <Text style={styles.driverStatValue}>{earnings.onlineTime}</Text>
            </View>
          </View>

          <Text style={styles.driverSectionTitle}>EARNINGS BREAKDOWN</Text>
          <View style={styles.driverListCard}>
            <View style={styles.driverEarningsRow}>
              <View>
                <Text style={styles.driverListPrimary}>Trip fares</Text>
                <Text style={styles.driverListSecondary}>
                  {earnings.trips} completed rides
                </Text>
              </View>
              <Text style={styles.driverListAmount}>{earnings.tripFares}</Text>
            </View>
            <View style={styles.driverEarningsRow}>
              <View>
                <Text style={styles.driverListPrimary}>Tips</Text>
                <Text style={styles.driverListSecondary}>From customers</Text>
              </View>
              <Text style={styles.driverListAmount}>{earnings.tips}</Text>
            </View>
            <View style={[styles.driverEarningsRow, styles.driverListLastRow]}>
              <View>
                <Text style={styles.driverListPrimary}>Total</Text>
                <Text style={styles.driverListSecondary}>Before payout</Text>
              </View>
              <Text style={styles.driverListAmount}>{earnings.amount}</Text>
            </View>
          </View>
        </ScrollView>
        <DriverBottomNavigation current={screen} onNavigate={setScreen} />
      </SafeAreaView>
    );
  }

  if (screen === "driverTrips") {
    const completedTrips = [
      {
        date: "Today · 4:18 PM",
        distance: "12.4 km · Completed",
        dropoff: "Fairview Park Mall",
        earnings: "$21.60",
        pickup: "Kitchener City Hall",
      },
      {
        date: "Today · 1:42 PM",
        distance: "8.7 km · Completed",
        dropoff: "University of Waterloo",
        earnings: "$17.25",
        pickup: "Waterloo Public Square",
      },
      {
        date: "Today · 10:06 AM",
        distance: "6.9 km · Completed",
        dropoff: "Stanley Park",
        earnings: "$14.80",
        pickup: "Kitchener GO Station",
      },
    ];

    return (
      <SafeAreaView style={styles.driverSecondaryScreen}>
        <StatusBar hidden />
        <ScrollView
          contentContainerStyle={styles.driverSecondaryContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.driverSecondaryTitle}>DRIVER TRIPS</Text>
          <Text style={styles.driverSecondarySubtitle}>
            Your rides in one place.
          </Text>

          <View style={styles.driverSegmentRow}>
            {[
              { key: "completed" as const, label: "COMPLETED" },
              { key: "scheduled" as const, label: "SCHEDULED" },
            ].map((item) => {
              const selected = driverTripsFilter === item.key;
              return (
                <Pressable
                  accessibilityLabel={`Show ${item.label.toLowerCase()} trips`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={item.key}
                  onPress={() => setDriverTripsFilter(item.key)}
                  style={({ pressed }) => [
                    styles.driverSegmentButton,
                    selected && styles.driverSegmentButtonSelectedBlue,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.driverSegmentText,
                      selected && styles.driverSegmentTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {driverTripsFilter === "completed" ? (
            <View style={styles.driverTripList}>
              {completedTrips.map((trip) => (
                <View style={styles.driverTripCard} key={trip.date}>
                  <View style={styles.driverTripTopRow}>
                    <Text style={styles.driverTripDate}>{trip.date}</Text>
                    <Text style={styles.driverTripEarnings}>
                      {trip.earnings}
                    </Text>
                  </View>
                  <View style={styles.driverRouteRow}>
                    <View style={styles.driverPickupDot} />
                    <Text style={styles.driverRouteText}>{trip.pickup}</Text>
                  </View>
                  <View style={styles.driverRouteRow}>
                    <View style={styles.driverDropoffDot} />
                    <Text style={styles.driverRouteText}>{trip.dropoff}</Text>
                  </View>
                  <Text style={styles.driverTripMeta}>{trip.distance}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.driverEmptyCard}>
              <Text style={styles.driverEmptyText}>
                No scheduled trips yet.
              </Text>
            </View>
          )}
        </ScrollView>
        <DriverBottomNavigation current={screen} onNavigate={setScreen} />
      </SafeAreaView>
    );
  }

  if (screen === "driverAccount") {
    const activeShift = driverProfileShifts[0] || profileShiftOptions[0].time;
    const cycleDistrict = () => {
      const index = districts.indexOf(driverProfileDistrict);
      setDriverProfileDistrict(districts[(index + 1) % districts.length]);
    };
    const cycleShift = () => {
      const shiftTimes = profileShiftOptions.map((item) => item.time);
      const index = shiftTimes.indexOf(activeShift);
      setDriverProfileShifts([shiftTimes[(index + 1) % shiftTimes.length]]);
    };

    return (
      <SafeAreaView style={styles.driverSecondaryScreen}>
        <StatusBar hidden />
        <ScrollView
          contentContainerStyle={styles.driverSecondaryContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.driverSecondaryTitle}>DRIVER ACCOUNT</Text>
          <Text style={styles.driverSecondarySubtitle}>
            Everything on one screen.
          </Text>

          <Text style={styles.driverSectionTitle}>PERSONAL INFORMATION</Text>
          <View style={styles.driverAccountFields}>
            <Text style={styles.driverAccountLabel}>FULL NAME</Text>
            <TextInput
              accessibilityLabel="Driver account full name"
              onChangeText={setDriverAccountFullName}
              style={styles.driverAccountInput}
              value={driverAccountFullName}
            />
            <Text style={styles.driverAccountLabel}>MOBILE NUMBER</Text>
            <TextInput
              accessibilityLabel="Driver account mobile number"
              keyboardType="phone-pad"
              onChangeText={setDriverAccountPhone}
              style={styles.driverAccountInput}
              value={driverAccountPhone}
            />
            <Text style={styles.driverAccountLabel}>EMAIL ADDRESS</Text>
            <TextInput
              accessibilityLabel="Driver account email address"
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setDriverAccountEmail}
              style={styles.driverAccountInput}
              value={driverAccountEmail}
            />
          </View>

          <Text style={styles.driverSectionTitle}>DISTRICT &amp; SHIFT</Text>
          <View style={styles.driverAccountTwoColumn}>
            <View style={styles.driverAccountHalfField}>
              <Text style={styles.driverAccountLabel}>DISTRICT</Text>
              <Pressable
                accessibilityLabel={`District ${driverProfileDistrict}. Press to change.`}
                accessibilityRole="button"
                onPress={cycleDistrict}
                style={({ pressed }) => [
                  styles.driverAccountSelector,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.driverAccountSelectorText}>
                  {driverProfileDistrict}
                </Text>
                <Text style={styles.driverAccountSelectorArrow}>⌄</Text>
              </Pressable>
            </View>
            <View style={styles.driverAccountHalfField}>
              <Text style={styles.driverAccountLabel}>SHIFT</Text>
              <Pressable
                accessibilityLabel={`Shift ${activeShift}. Press to change.`}
                accessibilityRole="button"
                onPress={cycleShift}
                style={({ pressed }) => [
                  styles.driverAccountSelector,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.driverAccountSelectorText}>{activeShift}</Text>
                <Text style={styles.driverAccountSelectorArrow}>⌄</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.driverSectionTitle}>VEHICLE INFORMATION</Text>
          <View style={styles.driverAccountFields}>
            <View style={styles.driverAccountTwoColumn}>
              <View style={styles.driverAccountHalfField}>
                <Text style={styles.driverAccountLabel}>MAKE</Text>
                <TextInput
                  accessibilityLabel="Vehicle make"
                  onChangeText={setDriverVehicleMake}
                  style={styles.driverAccountInput}
                  value={driverVehicleMake}
                />
              </View>
              <View style={styles.driverAccountHalfField}>
                <Text style={styles.driverAccountLabel}>MODEL</Text>
                <TextInput
                  accessibilityLabel="Vehicle model"
                  onChangeText={setDriverVehicleModel}
                  style={styles.driverAccountInput}
                  value={driverVehicleModel}
                />
              </View>
            </View>
            <View style={styles.driverAccountTwoColumn}>
              <View style={styles.driverAccountHalfField}>
                <Text style={styles.driverAccountLabel}>YEAR</Text>
                <TextInput
                  accessibilityLabel="Vehicle year"
                  keyboardType="numeric"
                  onChangeText={setDriverVehicleYear}
                  style={styles.driverAccountInput}
                  value={driverVehicleYear}
                />
              </View>
              <View style={styles.driverAccountHalfField}>
                <Text style={styles.driverAccountLabel}>COLOUR</Text>
                <TextInput
                  accessibilityLabel="Vehicle colour"
                  onChangeText={setDriverVehicleColour}
                  style={styles.driverAccountInput}
                  value={driverVehicleColour}
                />
              </View>
            </View>
            <Text style={styles.driverAccountLabel}>LICENCE PLATE</Text>
            <TextInput
              accessibilityLabel="Vehicle licence plate"
              autoCapitalize="characters"
              onChangeText={setDriverVehiclePlate}
              style={styles.driverAccountInput}
              value={driverVehiclePlate}
            />
          </View>

          <Pressable
            accessibilityLabel="Save driver account changes"
            accessibilityRole="button"
            onPress={() =>
              Alert.alert("Changes Saved", "Your driver account was updated.")
            }
            style={({ pressed }) => [
              styles.driverAccountSaveButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.driverAccountSaveText}>SAVE CHANGES</Text>
          </Pressable>
        </ScrollView>
        <DriverBottomNavigation current={screen} onNavigate={setScreen} />
      </SafeAreaView>
    );
  }

  if (screen === "customerFareCheckpoint") {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar hidden />
        <View style={styles.phoneCanvas}>
          <Image
            accessibilityLabel="Your OK Let's Go ride estimate"
            resizeMode="contain"
            source={fareEstimateArtwork}
            style={{
              position: "absolute",
              left: fareEstimateFrame.x,
              top: fareEstimateFrame.y,
              width: fareEstimateFrame.width,
              height: fareEstimateFrame.height,
            }}
          />

          <Pressable
            accessibilityLabel="Back to Customer Home"
            accessibilityRole="button"
            onPress={() => setScreen("customerHome")}
            style={({ pressed }) => [
              styles.fareEstimateHotspot,
              {
                left: fareEstimateFrame.x,
                top: fareEstimateFrame.y + fareEstimateFrame.height * 0.018,
                width: fareEstimateFrame.width * 0.13,
                height: fareEstimateFrame.height * 0.07,
              },
              pressed && styles.hotspotPressed,
            ]}
          />

          <Pressable
            accessibilityLabel="Confirm ride"
            accessibilityRole="button"
            onPress={() => setScreen("rideBookedCheckpoint")}
            style={({ pressed }) => [
              styles.fareEstimateHotspot,
              {
                left: fareEstimateFrame.x + fareEstimateFrame.width * 0.043,
                top:
                  fareEstimateFrame.y + fareEstimateFrame.height * 0.846,
                width: fareEstimateFrame.width * 0.914,
                height: fareEstimateFrame.height * 0.074,
              },
              pressed && styles.greenHotspotPressed,
            ]}
          />

          <Pressable
            accessibilityLabel="Back and edit ride"
            accessibilityRole="button"
            onPress={() => setScreen("customerHome")}
            style={({ pressed }) => [
              styles.fareEstimateHotspot,
              {
                left: fareEstimateFrame.x + fareEstimateFrame.width * 0.043,
                top:
                  fareEstimateFrame.y + fareEstimateFrame.height * 0.913,
                width: fareEstimateFrame.width * 0.914,
                height: fareEstimateFrame.height * 0.055,
              },
              pressed && styles.blueHotspotPressed,
            ]}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "rideBookedCheckpoint") {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar hidden />
        <View style={styles.phoneCanvas}>
          <Image
            accessibilityLabel="Ride booked with Marcus D. as your assigned driver"
            resizeMode="contain"
            source={rideBookedArtwork}
            style={{
              position: "absolute",
              left: rideBookedFrame.x,
              top: rideBookedFrame.y,
              width: rideBookedFrame.width,
              height: rideBookedFrame.height,
            }}
          />

          <DemoNavigation
            frame={rideBookedFrame}
            onBack={() => setScreen("customerFareCheckpoint")}
            onNext={() => setScreen("driverTrackingCheckpoint")}
          />

          <Pressable
            accessibilityLabel="Call Marcus D."
            accessibilityRole="button"
            onPress={() =>
              Alert.alert("Call Marcus D.", "Demo call control is working.")
            }
            style={({ pressed }) => [
              styles.fareEstimateHotspot,
              {
                left: rideBookedFrame.x + rideBookedFrame.width * 0.505,
                top: rideBookedFrame.y + rideBookedFrame.height * 0.385,
                width: rideBookedFrame.width * 0.385,
                height: rideBookedFrame.height * 0.058,
              },
              pressed && styles.greenHotspotPressed,
            ]}
          />

          <Pressable
            accessibilityLabel="Message Marcus D."
            accessibilityRole="button"
            onPress={() =>
              Alert.alert("Message Marcus D.", "Demo message control is working.")
            }
            style={({ pressed }) => [
              styles.fareEstimateHotspot,
              {
                left: rideBookedFrame.x + rideBookedFrame.width * 0.505,
                top: rideBookedFrame.y + rideBookedFrame.height * 0.454,
                width: rideBookedFrame.width * 0.385,
                height: rideBookedFrame.height * 0.058,
              },
              pressed && styles.greenHotspotPressed,
            ]}
          />

          <Pressable
            accessibilityLabel="Track my driver"
            accessibilityRole="button"
            onPress={() => setScreen("driverTrackingCheckpoint")}
            style={({ pressed }) => [
              styles.fareEstimateHotspot,
              {
                left: rideBookedFrame.x + rideBookedFrame.width * 0.038,
                top: rideBookedFrame.y + rideBookedFrame.height * 0.892,
                width: rideBookedFrame.width * 0.924,
                height: rideBookedFrame.height * 0.076,
              },
              pressed && styles.greenHotspotPressed,
            ]}
          />

        </View>
      </SafeAreaView>
    );
  }

  if (screen === "driverArrived") {
    return (
      <SafeAreaView style={styles.driverArrivedScreen}>
        <StatusBar hidden />
        <View style={styles.driverArrivedMap}>
          <LiveDriverMap pickupCoordinate={passengerPickupCoordinate} />
          <View pointerEvents="none" style={styles.driverArrivedPill}>
            <Text style={styles.driverArrivedPillText}>ARRIVED</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.driverArrivedContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.driverArrivedTitle}>You've arrived</Text>
          <Text style={styles.driverArrivedSubtitle}>
            Waiting for Marcus D.
          </Text>

          <View style={styles.driverWaitCard}>
            <Text style={styles.driverWaitLabel}>
              {driverWaitSeconds >= 0
                ? "FREE WAITING TIME"
                : "PAID WAITING TIME"}
            </Text>
            <Text style={styles.driverWaitTimer}>
              {driverWaitSeconds >= 0
                ? `${waitMinutes}:${waitSeconds}`
                : `+${chargedWaitMinutes}:00`}
            </Text>
            <Text
              style={[
                styles.driverWaitStatus,
                driverWaitSeconds < 0 && styles.driverWaitStatusCharging,
              ]}
            >
              {driverWaitSeconds >= 0
                ? "No waiting charge yet"
                : `Waiting charge: $${currentWaitingCharge.toFixed(2)}`}
            </Text>
          </View>

          <View style={styles.driverArrivedRiderCard}>
            <View style={styles.driverArrivedAvatar}>
              <Text style={styles.driverArrivedAvatarText}>MD</Text>
            </View>
            <View style={styles.driverArrivedRiderDetails}>
              <Text style={styles.driverArrivedRiderName}>Marcus D.</Text>
              <Text style={styles.driverArrivedAddress} numberOfLines={1}>
                100 Queen Street West, Toronto
              </Text>
            </View>
          </View>

          <View style={styles.driverArrivedContactRow}>
            <Pressable
              accessibilityLabel="Message Marcus D."
              accessibilityRole="button"
              onPress={() =>
                Alert.alert("Message Marcus D.", "Demo message control is working.")
              }
              style={({ pressed }) => [
                styles.driverArrivedContactButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.driverArrivedContactText}>MESSAGE</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Call Marcus D."
              accessibilityRole="button"
              onPress={() =>
                Alert.alert("Call Marcus D.", "Demo call control is working.")
              }
              style={({ pressed }) => [
                styles.driverArrivedContactButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.driverArrivedContactText}>CALL</Text>
            </Pressable>
          </View>

          <Pressable
            accessibilityLabel="Start trip"
            accessibilityRole="button"
            onPress={() => setScreen("tripInProgressCheckpoint")}
            style={({ pressed }) => [
              styles.driverArrivedStartButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.driverArrivedStartText}>START TRIP</Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Cancel ride"
            accessibilityRole="button"
            onPress={() =>
              Alert.alert("Cancel Ride?", "Select an action.", [
                { text: "Keep Ride", style: "cancel" },
                {
                  text: "Cancel Ride",
                  style: "destructive",
                  onPress: () => setScreen("driverHome"),
                },
              ])
            }
            style={({ pressed }) => [
              styles.driverArrivedCancelButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.driverArrivedCancelText}>CANCEL RIDE</Text>
          </Pressable>

          <Text style={styles.driverArrivedChargeNote}>
            After 3 minutes: $0.50/min waiting charge
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === "tripInProgressCheckpoint") {
    return (
      <SafeAreaView style={styles.liveTripScreen}>
        <StatusBar hidden />
        <View style={styles.liveTripMap}>
          <LiveDriverMap pickupCoordinate={tripDestinationCoordinate} />
          <View pointerEvents="none" style={styles.liveMapPill}>
            <Text style={styles.liveMapPillText}>TRIP IN PROGRESS</Text>
          </View>
        </View>

        <View style={styles.liveTripPanel}>
          <Text style={styles.liveTripEyebrow}>DESTINATION</Text>
          <Text style={styles.liveTripTitle}>Union Station</Text>
          <Text style={styles.liveTripAddress}>
            65 Front Street West, Toronto
          </Text>

          <View style={styles.liveTripStatsRow}>
            <View style={styles.liveTripStat}>
              <Text style={styles.liveTripStatValue}>12 min</Text>
              <Text style={styles.liveTripStatLabel}>ESTIMATED TIME</Text>
            </View>
            <View style={styles.liveTripStatDivider} />
            <View style={styles.liveTripStat}>
              <Text style={styles.liveTripStatValue}>3.8 km</Text>
              <Text style={styles.liveTripStatLabel}>DISTANCE</Text>
            </View>
          </View>

          <View style={styles.liveTripButtonRow}>
            <Pressable
              accessibilityLabel="Back to arrived screen"
              accessibilityRole="button"
              onPress={() => setScreen("driverArrived")}
              style={({ pressed }) => [
                styles.liveTripSecondaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.liveTripSecondaryText}>BACK</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Complete trip"
              accessibilityRole="button"
              onPress={() => setScreen("tripCompleteCheckpoint")}
              style={({ pressed }) => [
                styles.liveTripPrimaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.liveTripPrimaryText}>COMPLETE TRIP</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "tripCompleteCheckpoint") {
    const tipChoices = [
      { label: "$5", left: 0.081, width: 0.146 },
      { label: "$10", left: 0.237, width: 0.149 },
      { label: "$20", left: 0.397, width: 0.148 },
      { label: "Custom", left: 0.556, width: 0.181 },
      { label: "No Tip", left: 0.748, width: 0.168 },
    ];

    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar hidden />
        <View style={styles.phoneCanvas}>
          <Image
            accessibilityLabel="You've arrived, rate Marcus D. and add a tip"
            resizeMode="contain"
            source={tripCompleteArtwork}
            style={{
              position: "absolute",
              left: tripCompleteFrame.x,
              top: tripCompleteFrame.y,
              width: tripCompleteFrame.width,
              height: tripCompleteFrame.height,
            }}
          />

          {[1, 2, 3, 4, 5].map((rating, index) => (
            <Pressable
              accessibilityLabel={`Rate Marcus ${rating} star${
                rating === 1 ? "" : "s"
              }`}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedRating === rating }}
              key={`rating-${rating}`}
              onPress={() => {
                setSelectedRating(rating);
                Alert.alert(
                  "Rating Selected",
                  `${rating} star${rating === 1 ? "" : "s"} selected.`,
                );
              }}
              style={({ pressed }) => [
                styles.fareEstimateHotspot,
                {
                  left:
                    tripCompleteFrame.x +
                    tripCompleteFrame.width * (0.097 + index * 0.145),
                  top:
                    tripCompleteFrame.y + tripCompleteFrame.height * 0.622,
                  width: tripCompleteFrame.width * 0.13,
                  height: tripCompleteFrame.height * 0.075,
                },
                pressed && styles.greenHotspotPressed,
              ]}
            />
          ))}

          {tipChoices.map((tip) => (
            <Pressable
              accessibilityLabel={`Select ${tip.label} tip`}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedTip === tip.label }}
              key={tip.label}
              onPress={() => {
                setSelectedTip(tip.label);
                Alert.alert(
                  tip.label === "Custom" ? "Custom Tip" : "Tip Selected",
                  tip.label === "Custom"
                    ? "A custom tip amount can be entered in the final app."
                    : `${tip.label} selected.`,
                );
              }}
              style={({ pressed }) => [
                styles.fareEstimateHotspot,
                {
                  left: tripCompleteFrame.x + tripCompleteFrame.width * tip.left,
                  top:
                    tripCompleteFrame.y + tripCompleteFrame.height * 0.789,
                  width: tripCompleteFrame.width * tip.width,
                  height: tripCompleteFrame.height * 0.059,
                },
                pressed && styles.greenHotspotPressed,
              ]}
            />
          ))}

          <Pressable
            accessibilityLabel="Back to trip in progress"
            accessibilityRole="button"
            onPress={() => setScreen("tripInProgressCheckpoint")}
            style={({ pressed }) => [
              styles.fareEstimateHotspot,
              {
                left: tripCompleteFrame.x + tripCompleteFrame.width * 0.046,
                top: tripCompleteFrame.y + tripCompleteFrame.height * 0.908,
                width: tripCompleteFrame.width * 0.42,
                height: tripCompleteFrame.height * 0.08,
              },
              pressed && styles.greenHotspotPressed,
            ]}
          />

          <Pressable
            accessibilityLabel="Submit rating and tip"
            accessibilityRole="button"
            onPress={() => {
              const tipMessage =
                selectedTip === "No Tip"
                  ? "no tip"
                  : selectedTip === "Custom"
                    ? "a custom tip"
                    : `a ${selectedTip} tip`;
              Alert.alert(
                "Thank You!",
                `Your ${selectedRating}-star rating and ${tipMessage} were submitted.`,
              );
              setScreen("customerHome");
            }}
            style={({ pressed }) => [
              styles.fareEstimateHotspot,
              {
                left: tripCompleteFrame.x + tripCompleteFrame.width * 0.495,
                top: tripCompleteFrame.y + tripCompleteFrame.height * 0.908,
                width: tripCompleteFrame.width * 0.45,
                height: tripCompleteFrame.height * 0.08,
              },
              pressed && styles.greenHotspotPressed,
            ]}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "driverTrackingCheckpoint") {
    return (
      <SafeAreaView style={styles.liveTripScreen}>
        <StatusBar hidden />
        <View style={styles.liveTripMap}>
          <LiveDriverMap pickupCoordinate={passengerPickupCoordinate} />
          <View pointerEvents="none" style={styles.liveMapPill}>
            <Text style={styles.liveMapPillText}>DRIVER ON THE WAY</Text>
          </View>
        </View>

        <View style={styles.liveTripPanel}>
          <Text style={styles.liveTripEyebrow}>PICKUP</Text>
          <Text style={styles.liveTripTitle}>Marcus D.</Text>
          <Text style={styles.liveTripAddress}>
            100 Queen Street West, Toronto
          </Text>

          <View style={styles.liveTripStatsRow}>
            <View style={styles.liveTripStat}>
              <Text style={styles.liveTripStatValue}>4 min</Text>
              <Text style={styles.liveTripStatLabel}>DRIVER ARRIVAL</Text>
            </View>
            <View style={styles.liveTripStatDivider} />
            <View style={styles.liveTripStat}>
              <Text style={styles.liveTripStatValue}>1.2 km</Text>
              <Text style={styles.liveTripStatLabel}>AWAY</Text>
            </View>
          </View>

          <View style={styles.liveTripContactRow}>
            <Pressable
              accessibilityLabel="Call Marcus D."
              accessibilityRole="button"
              onPress={() =>
                Alert.alert("Call Marcus D.", "Demo call control is working.")
              }
              style={({ pressed }) => [
                styles.liveTripContactButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.liveTripContactText}>CALL</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Message Marcus D."
              accessibilityRole="button"
              onPress={() =>
                Alert.alert("Message Marcus D.", "Demo message control is working.")
              }
              style={({ pressed }) => [
                styles.liveTripContactButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.liveTripContactText}>MESSAGE</Text>
            </Pressable>
          </View>

          <View style={styles.liveTripButtonRow}>
            <Pressable
              accessibilityLabel="Back to ride booked"
              accessibilityRole="button"
              onPress={() => setScreen("rideBookedCheckpoint")}
              style={({ pressed }) => [
                styles.liveTripSecondaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.liveTripSecondaryText}>BACK</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Driver has arrived"
              accessibilityRole="button"
              onPress={() => setScreen("driverArrived")}
              style={({ pressed }) => [
                styles.liveTripPrimaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.liveTripPrimaryText}>DRIVER ARRIVED</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "driverSignUpCheckpoint") {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar hidden />
        <View style={styles.phoneCanvas}>
          <ScrollView
            contentContainerStyle={styles.customerSignUpContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.customerSignUpTopRow}>
              <Pressable
                accessibilityLabel="Return to Driver Sign In"
                accessibilityRole="button"
                onPress={() => setScreen("signIn")}
                style={({ pressed }) => [
                  styles.customerSignUpBackButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.customerSignUpBackText}>BACK</Text>
              </Pressable>
            </View>

            <Image
              accessibilityLabel="Official OK Let's Go logo"
              resizeMode="contain"
              source={officialLogo}
              style={styles.customerSignUpLogo}
            />

            <Text style={styles.driverSignUpTitle}>LET’S GET YOU DRIVING</Text>
            <Text style={styles.driverSignUpSubtitle}>
              Create your driver account to start earning with{" "}
              <Text style={styles.customerSignUpSubtitleBrand}>
                OK Let’s Go.
              </Text>
            </Text>

            <View style={styles.customerSignUpCard}>
              <Text style={styles.customerSignUpFieldLabel}>FULL NAME</Text>
              <TextInput
                accessibilityLabel="Driver Full Name"
                autoCapitalize="words"
                onChangeText={setDriverFullName}
                placeholder="Enter your full name"
                placeholderTextColor="#7890AD"
                style={styles.customerSignUpInput}
                value={driverFullName}
              />

              <Text style={styles.customerSignUpFieldLabel}>MOBILE NUMBER</Text>
              <TextInput
                accessibilityLabel="Driver Mobile Number"
                keyboardType="phone-pad"
                onChangeText={setDriverPhone}
                placeholder="Enter your mobile number"
                placeholderTextColor="#7890AD"
                style={styles.customerSignUpInput}
                value={driverPhone}
              />

              <Text style={styles.customerSignUpFieldLabel}>EMAIL ADDRESS</Text>
              <TextInput
                accessibilityLabel="Driver Email Address"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={setDriverEmail}
                placeholder="Enter your email address"
                placeholderTextColor="#7890AD"
                style={styles.customerSignUpInput}
                value={driverEmail}
              />

              <Text style={styles.customerSignUpFieldLabel}>PASSWORD</Text>
              <View style={styles.driverPasswordRow}>
                <TextInput
                  accessibilityLabel="Driver Password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={setDriverPassword}
                  placeholder="Create a password"
                  placeholderTextColor="#7890AD"
                  secureTextEntry={!driverPasswordVisible}
                  style={styles.driverPasswordInput}
                  value={driverPassword}
                />
                <Pressable
                  accessibilityLabel={
                    driverPasswordVisible ? "Hide password" : "Show password"
                  }
                  accessibilityRole="button"
                  onPress={() => setDriverPasswordVisible((current) => !current)}
                  style={({ pressed }) => [
                    styles.driverPasswordToggle,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.driverPasswordToggleText}>
                    {driverPasswordVisible ? "HIDE" : "SHOW"}
                  </Text>
                </Pressable>
              </View>
            </View>

            <Pressable
              accessibilityLabel="Create Driver Account and continue"
              accessibilityRole="button"
              onPress={() => setScreen("driverDistrictShiftCheckpoint")}
              style={({ pressed }) => [
                styles.customerSignUpContinueButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.customerSignUpContinueText}>CONTINUE</Text>
              <Text style={styles.customerSignUpContinueArrow}>→</Text>
            </Pressable>

            <Pressable
              accessibilityLabel="Sign in to an existing Driver account"
              accessibilityRole="button"
              onPress={() => setScreen("signIn")}
              style={({ pressed }) => [
                styles.driverExistingAccount,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.driverExistingAccountText}>
                Already have an account?{" "}
                <Text style={styles.driverExistingAccountLink}>SIGN IN</Text>
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "driverDistrictShiftCheckpoint") {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar hidden />
        <View style={styles.phoneCanvas}>
          <ScrollView
            contentContainerStyle={styles.driverProfileContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Image
              accessibilityLabel="Official OK Let's Go logo"
              resizeMode="contain"
              source={officialLogo}
              style={styles.driverProfileLogo}
            />

            <Text style={styles.driverProfileTitle}>DISTRICT &amp; SHIFT</Text>
            <Text style={styles.driverProfileSubtitle}>
              Choose where and when you prefer to drive.
            </Text>

            <View style={styles.driverProfilePanel}>
              <Text style={styles.driverProfileSectionTitle}>
                DRIVING DISTRICT
              </Text>
              <Text style={styles.driverProfileHint}>Choose one district.</Text>
              <View style={styles.driverProfileOptions}>
                {districts.map((item) => {
                  const selected = driverProfileDistrict === item;
                  return (
                    <Pressable
                      accessibilityLabel={`Select ${item} district`}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      key={item}
                      onPress={() => setDriverProfileDistrict(item)}
                      style={({ pressed }) => [
                        styles.driverProfileOption,
                        selected && styles.driverProfileOptionSelected,
                        pressed && styles.buttonPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.driverProfileOptionText,
                          selected && styles.driverProfileOptionTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.driverProfilePanel}>
              <Text style={styles.driverProfileSectionTitle}>
                PREFERRED SHIFT(S)
              </Text>
              <Text style={styles.driverProfileHint}>
                Choose one or more shifts.
              </Text>
              <View style={styles.driverProfileOptions}>
                {profileShiftOptions.map((item) => {
                  const selected = driverProfileShifts.includes(item.time);
                  return (
                    <Pressable
                      accessibilityLabel={`${
                        selected ? "Remove" : "Select"
                      } ${item.label}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      key={item.time}
                      onPress={() =>
                        setDriverProfileShifts((current) =>
                          current.includes(item.time)
                            ? current.filter((shift) => shift !== item.time)
                            : [...current, item.time],
                        )
                      }
                      style={({ pressed }) => [
                        styles.driverProfileOption,
                        selected && styles.driverProfileOptionSelected,
                        pressed && styles.buttonPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.driverProfileOptionText,
                          selected && styles.driverProfileOptionTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Text style={styles.driverProfileOptionTime}>
                        {item.time}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.driverProfileActions}>
              <Pressable
                accessibilityLabel="Return to Driver Signup"
                accessibilityRole="button"
                onPress={() => setScreen("driverSignUpCheckpoint")}
                style={({ pressed }) => [
                  styles.driverProfileBackButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.driverProfileActionText}>BACK</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Continue to Driver Home"
                accessibilityRole="button"
                onPress={() => {
                  if (driverFullName.trim()) {
                    setDriverAccountFullName(driverFullName.trim());
                  }
                  if (driverPhone.trim()) {
                    setDriverAccountPhone(driverPhone.trim());
                  }
                  if (driverEmail.trim()) {
                    setDriverAccountEmail(driverEmail.trim());
                  }
                  setScreen("driverHome");
                }}
                style={({ pressed }) => [
                  styles.driverProfileContinueButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.driverProfileActionText}>CONTINUE →</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "customerHelpCheckpoint") {
    let checkpointTitle = "SIGNED IN";

    if (screen === "customerHelpCheckpoint") {
      checkpointTitle = "HELP";
    }

    let checkpointBackTarget: AppScreen = "signIn";
    let checkpointMessage = "Ready to build next.";
    let checkpointButtonText = "BACK";

    checkpointBackTarget = "customerHome";

    return (
      <SafeAreaView style={styles.checkpointScreen}>
        <StatusBar hidden />
        <Image
          accessibilityLabel="Official OK Let's Go logo"
          resizeMode="contain"
          source={officialLogo}
          style={styles.checkpointLogo}
        />
        <Text style={styles.checkpointTitle}>{checkpointTitle}</Text>
        <Text style={styles.checkpointText}>{checkpointMessage}</Text>
        <Pressable
          accessibilityLabel={
            "Return to the previous page"
          }
          accessibilityRole="button"
          onPress={() => setScreen(checkpointBackTarget)}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.backButtonText}>{checkpointButtonText}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (screen === "signIn") {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar hidden />
        <View style={styles.phoneCanvas}>
          <Image
            accessibilityLabel="Welcome back to OK Let's Go sign in"
            resizeMode="contain"
            source={signInArtwork}
            style={{
              position: "absolute",
              left: signInFrame.x,
              top: signInFrame.y,
              width: signInFrame.width,
              height: signInFrame.height,
            }}
          />

          <Pressable
            accessibilityLabel="Return to Role Selection"
            accessibilityRole="button"
            onPress={() => setScreen("roleSelection")}
            style={({ pressed }) => [
              styles.signInBackButton,
              {
                left: signInFrame.x + signInFrame.width * 0.018,
                top: signInFrame.y + signInFrame.height * 0.016,
              },
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.signInBackText}>BACK</Text>
          </Pressable>

          <TextInput
            accessibilityLabel="Email or mobile number"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setSignInIdentifier}
            placeholder="EMAIL OR MOBILE NUMBER"
            placeholderTextColor="#78D92F"
            style={[
              styles.signInPageInput,
              {
                left: signInFrame.x + signInFrame.width * 0.284,
                top: signInFrame.y + signInFrame.height * 0.416,
                width: signInFrame.width * 0.535,
                height: signInFrame.height * 0.066,
              },
            ]}
            value={signInIdentifier}
          />

          <TextInput
            accessibilityLabel="Password"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setSignInPassword}
            placeholder="PASSWORD"
            placeholderTextColor="#78D92F"
            secureTextEntry={!passwordVisible}
            style={[
              styles.signInPageInput,
              {
                left: signInFrame.x + signInFrame.width * 0.284,
                top: signInFrame.y + signInFrame.height * 0.519,
                width: signInFrame.width * 0.445,
                height: signInFrame.height * 0.066,
              },
            ]}
            value={signInPassword}
          />

          <Pressable
            accessibilityLabel={
              passwordVisible ? "Hide password" : "Show password"
            }
            accessibilityRole="button"
            accessibilityState={{ expanded: passwordVisible }}
            onPress={() => setPasswordVisible((current) => !current)}
            style={({ pressed }) => [
              styles.signInPageHotspot,
              {
                left: signInFrame.x + signInFrame.width * 0.731,
                top: signInFrame.y + signInFrame.height * 0.526,
                width: signInFrame.width * 0.092,
                height: signInFrame.height * 0.054,
              },
              pressed && styles.greenHotspotPressed,
            ]}
          />

          <Pressable
            accessibilityLabel="Forgot password"
            accessibilityRole="button"
            onPress={openForgotPassword}
            style={({ pressed }) => [
              styles.signInPageHotspot,
              {
                left: signInFrame.x + signInFrame.width * 0.548,
                top: signInFrame.y + signInFrame.height * 0.607,
                width: signInFrame.width * 0.299,
                height: signInFrame.height * 0.045,
              },
              pressed && styles.orangeHotspotPressed,
            ]}
          />

          <Pressable
            accessibilityLabel="Sign in"
            accessibilityRole="button"
            onPress={handleSignIn}
            style={({ pressed }) => [
              styles.signInPageHotspot,
              {
                left: signInFrame.x + signInFrame.width * 0.158,
                top: signInFrame.y + signInFrame.height * 0.652,
                width: signInFrame.width * 0.684,
                height: signInFrame.height * 0.067,
              },
              pressed && styles.greenHotspotPressed,
            ]}
          />

          <Pressable
            accessibilityLabel="Create an account"
            accessibilityRole="button"
            onPress={() => {
              if (selectedRole === "driver") {
                setScreen("driverSignUpCheckpoint");
              } else {
                openCustomerSignUp();
              }
            }}
            style={({ pressed }) => [
              styles.signInPageHotspot,
              {
                left: signInFrame.x + signInFrame.width * 0.158,
                top: signInFrame.y + signInFrame.height * 0.779,
                width: signInFrame.width * 0.684,
                height: signInFrame.height * 0.064,
              },
              pressed && styles.blueHotspotPressed,
            ]}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "roleSelection") {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar hidden />
        <View style={styles.phoneCanvas}>
          <Image
            accessibilityLabel="Choose Customer or Driver for OK Let's Go"
            resizeMode="contain"
            source={roleSelectionArtwork}
            style={{
              position: "absolute",
              left: roleFrame.x,
              top: roleFrame.y,
              width: roleFrame.width,
              height: roleFrame.height,
            }}
          />

          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[
              styles.roleSignInCover,
              {
                left: roleFrame.x,
                top: roleFrame.y + roleFrame.height * 0.807,
                width: roleFrame.width,
                height: roleFrame.height * 0.124,
              },
            ]}
          />

          <View
            pointerEvents="none"
            style={[
              styles.roleCardLowerContent,
              {
                left: roleFrame.x + roleFrame.width * 0.031,
                top: roleFrame.y + roleFrame.height * 0.655,
                width: roleFrame.width * 0.457,
                height: roleFrame.height * 0.235,
              },
            ]}
          >
            <View style={styles.roleCardDescriptionArea}>
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                numberOfLines={2}
                style={styles.roleCardDescription}
              >
                Book a ride, enjoy comfort{"\n"}and get where you need to go.
              </Text>
            </View>
            <View style={styles.roleExtendedButton}>
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                numberOfLines={1}
                style={styles.roleExtendedButtonText}
              >
                I’M A CUSTOMER
              </Text>
              <Text style={styles.roleExtendedButtonArrow}>›</Text>
            </View>
          </View>

          <View
            pointerEvents="none"
            style={[
              styles.roleCardLowerContent,
              {
                left: roleFrame.x + roleFrame.width * 0.512,
                top: roleFrame.y + roleFrame.height * 0.655,
                width: roleFrame.width * 0.457,
                height: roleFrame.height * 0.235,
              },
            ]}
          >
            <View style={styles.roleCardDescriptionArea}>
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                numberOfLines={2}
                style={styles.roleCardDescription}
              >
                Drive with OK Let’s Go{"\n"}and earn on your schedule.
              </Text>
            </View>
            <View style={styles.roleExtendedButton}>
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                numberOfLines={1}
                style={styles.roleExtendedButtonText}
              >
                I’M A DRIVER
              </Text>
              <Text style={styles.roleExtendedButtonArrow}>›</Text>
            </View>
          </View>

          <View
            pointerEvents="none"
            style={[
              styles.roleUnifiedBorder,
              {
                left: roleFrame.x + roleFrame.width * 0.031,
                top: roleFrame.y + roleFrame.height * 0.371,
                width: roleFrame.width * 0.457,
                height: roleFrame.height * 0.519,
              },
            ]}
          />

          <View
            pointerEvents="none"
            style={[
              styles.roleUnifiedBorder,
              {
                left: roleFrame.x + roleFrame.width * 0.512,
                top: roleFrame.y + roleFrame.height * 0.371,
                width: roleFrame.width * 0.457,
                height: roleFrame.height * 0.519,
              },
            ]}
          />

          <Pressable
            accessibilityLabel="Return to the Thank You page"
            accessibilityRole="button"
            onPress={() => setScreen("pageFour")}
            style={({ pressed }) => [
              styles.roleBackButton,
              {
                left: roleFrame.x + roleFrame.width * 0.026,
                top: roleFrame.y + roleFrame.height * 0.018,
              },
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.roleBackText}>BACK</Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Sign in as a Customer"
            accessibilityRole="button"
            onPress={() => openRoleSignIn("customer")}
            style={({ pressed }) => [
              styles.roleHotspot,
              {
                left: roleFrame.x + roleFrame.width * 0.031,
                top: roleFrame.y + roleFrame.height * 0.371,
                width: roleFrame.width * 0.457,
                height: roleFrame.height * 0.519,
              },
              pressed && styles.customerHotspotPressed,
            ]}
          />

          <Pressable
            accessibilityLabel="Sign in as a Driver"
            accessibilityRole="button"
            onPress={() => openRoleSignIn("driver")}
            style={({ pressed }) => [
              styles.roleHotspot,
              {
                left: roleFrame.x + roleFrame.width * 0.512,
                top: roleFrame.y + roleFrame.height * 0.371,
                width: roleFrame.width * 0.457,
                height: roleFrame.height * 0.519,
              },
              pressed && styles.driverHotspotPressed,
            ]}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "pageFour") {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar hidden />
        <View style={styles.phoneCanvas}>
          <Image
            accessibilityLabel="Thank you for choosing OK Let's Go"
            resizeMode="contain"
            source={pageFourArtwork}
            style={{
              position: "absolute",
              left: driverFrame.x,
              top: driverFrame.y,
              width: driverFrame.width,
              height: driverFrame.height,
            }}
          />

          <Pressable
            accessibilityLabel="Have a safe ride and continue"
            accessibilityRole="button"
            onPress={() => setScreen("roleSelection")}
            style={({ pressed }) => [
              styles.safeRideHotspot,
              {
                left: driverFrame.x + driverFrame.width * 0.092,
                top: driverFrame.y + driverFrame.height * 0.913,
                width: driverFrame.width * 0.816,
                height: driverFrame.height * 0.043,
              },
              pressed && styles.hotspotPressed,
            ]}
          />

          <View
            style={[
              styles.pageFourNavigationCover,
              {
                left: driverFrame.x,
                top: driverFrame.y + driverFrame.height * 0.956,
                width: driverFrame.width,
                height: driverFrame.height * 0.044,
              },
            ]}
          >
            <Pressable
              accessibilityLabel="Return to the Drivers Wanted page"
              accessibilityRole="button"
              onPress={() => setScreen("drivers")}
              style={({ pressed }) => [
                styles.pageFourBackButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.smallButtonText}>BACK</Text>
            </Pressable>

            <Pressable
              accessibilityLabel="Continue to Role Selection"
              accessibilityRole="button"
              onPress={() => setScreen("roleSelection")}
              style={({ pressed }) => [
                styles.pageFourNextButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.smallButtonText}>NEXT</Text>
              <Text style={styles.smallNextArrow}>→</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "drivers") {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar hidden />
        <View style={styles.phoneCanvas}>
          <Image
            accessibilityLabel="We're growing and looking for great OK Let's Go drivers"
            resizeMode="contain"
            source={driversArtwork}
            style={{
              position: "absolute",
              left: driverFrame.x,
              top: driverFrame.y,
              width: driverFrame.width,
              height: driverFrame.height,
            }}
          />

          <Pressable
            accessibilityLabel="Become a driver today"
            accessibilityRole="button"
            onPress={() => setScreen("driverApplication")}
            style={({ pressed }) => [
              styles.becomeDriverHotspot,
              {
                left: driverFrame.x + driverFrame.width * 0.064,
                top: driverFrame.y + driverFrame.height * 0.866,
                width: driverFrame.width * 0.872,
                height: driverFrame.height * 0.061,
              },
              pressed && styles.hotspotPressed,
            ]}
          />

          <View
            style={[
              styles.driverNavigationCover,
              {
                left: driverFrame.x,
                top: driverFrame.y + driverFrame.height * 0.934,
                width: driverFrame.width,
                height: driverFrame.height * 0.066,
              },
            ]}
          >
            <Pressable
              accessibilityLabel="Return to the Rewards page"
              accessibilityRole="button"
              onPress={() => setScreen("rewards")}
              style={({ pressed }) => [
                styles.smallBackButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.smallButtonText}>BACK</Text>
            </Pressable>

            <Pressable
              accessibilityLabel="Go to the next page"
              accessibilityRole="button"
              onPress={() => setScreen("pageFour")}
              style={({ pressed }) => [
                styles.smallNextButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.smallButtonText}>NEXT</Text>
              <Text style={styles.smallNextArrow}>→</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "rewards") {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar hidden />
        <View style={styles.phoneCanvas}>
          <ImageBackground
            accessibilityLabel="OK Let's Go rewards and free rides"
            resizeMode="contain"
            source={rewardsArtwork}
            style={styles.rewardsArtwork}
          >
            <View style={styles.rewardsNavigationArea}>
              <Pressable
                accessibilityLabel="Return to the Welcome page"
                accessibilityRole="button"
                onPress={() => setScreen("welcome")}
                style={({ pressed }) => [
                  styles.smallBackButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.smallButtonText}>BACK</Text>
              </Pressable>

              <Pressable
                accessibilityLabel="Go to the next page"
                accessibilityRole="button"
                onPress={() => setScreen("drivers")}
                style={({ pressed }) => [
                  styles.smallNextButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.smallButtonText}>NEXT</Text>
                <Text style={styles.smallNextArrow}>→</Text>
              </Pressable>
            </View>
          </ImageBackground>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar hidden />
      <View style={styles.phoneCanvas}>
        <ImageBackground
          accessibilityLabel="Welcome to OK Let's Go in Toronto"
          resizeMode="contain"
          source={welcomeArtwork}
          style={styles.welcomeArtwork}
        >
          <View style={styles.nextArea}>
            <Pressable
              accessibilityLabel="Go to the next page"
              accessibilityRole="button"
              onPress={() => setScreen("rewards")}
              style={({ pressed }) => [
                styles.nextButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.nextButtonText}>NEXT</Text>
              <Text style={styles.nextArrow}>→</Text>
            </Pressable>
          </View>
        </ImageBackground>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#050A12",
    alignItems: "center",
    justifyContent: "center",
  },
  phoneCanvas: {
    width: "100%",
    height: "100%",
    maxWidth: 520,
    backgroundColor: "#050A12",
  },
  welcomeArtwork: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  rewardsArtwork: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  rewardsNavigationArea: {
    width: "100%",
    minHeight: 72,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: "rgba(2, 7, 19, 0.96)",
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  becomeDriverHotspot: {
    position: "absolute",
    zIndex: 3,
    borderRadius: 20,
  },
  safeRideHotspot: {
    position: "absolute",
    zIndex: 3,
    borderRadius: 18,
  },
  fareEstimateHotspot: {
    position: "absolute",
    zIndex: 5,
    borderRadius: 18,
  },
  customerSecondaryHotspot: {
    position: "absolute",
    zIndex: 6,
    borderRadius: 16,
  },
  customerBottomTab: {
    position: "absolute",
    zIndex: 8,
    borderRadius: 18,
  },
  customerSecondaryBackButton: {
    position: "absolute",
    zIndex: 10,
    borderWidth: 2,
    borderColor: "#4ADE80",
    borderRadius: 11,
    backgroundColor: "rgba(19, 29, 46, 0.97)",
    alignItems: "center",
    justifyContent: "center",
  },
  customerSecondaryBackText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  accountEditScreen: {
    flex: 1,
    backgroundColor: "#050A12",
  },
  accountEditContent: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 28,
    backgroundColor: "#050A12",
  },
  accountEditTopRow: {
    width: "100%",
    alignItems: "flex-start",
  },
  accountEditBackButton: {
    width: 82,
    minHeight: 36,
    borderWidth: 2,
    borderColor: "#4ADE80",
    borderRadius: 11,
    backgroundColor: "#131D2E",
    alignItems: "center",
    justifyContent: "center",
  },
  accountEditBackText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },
  accountEditLogo: {
    width: 255,
    maxWidth: "82%",
    height: 145,
    marginTop: 2,
  },
  accountEditTitle: {
    color: "#22C55E",
    fontSize: 29,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: 1.4,
    textAlign: "center",
  },
  accountEditSubtitle: {
    color: "#FF6B00",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
    letterSpacing: 1.2,
    textAlign: "center",
  },
  accountEditCard: {
    width: "100%",
    maxWidth: 470,
    marginTop: 18,
    padding: 16,
    borderWidth: 2,
    borderColor: "#1677EA",
    borderRadius: 22,
    backgroundColor: "#091422",
    shadowColor: "#1677EA",
    shadowOpacity: 0.32,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  accountEditLabel: {
    marginBottom: 6,
    color: "#22C55E",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  accountEditInput: {
    width: "100%",
    minHeight: 48,
    marginBottom: 14,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: "#1677EA",
    borderRadius: 12,
    backgroundColor: "#050D19",
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  accountEditSaveButton: {
    width: "100%",
    maxWidth: 470,
    minHeight: 54,
    marginTop: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: "#16A34A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  accountEditSaveText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1,
  },
  accountEditSaveArrow: {
    position: "absolute",
    right: 18,
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },
  roleHotspot: {
    position: "absolute",
    zIndex: 5,
    borderRadius: 18,
  },
  roleSignInCover: {
    position: "absolute",
    zIndex: 2,
    backgroundColor: "#020713",
  },
  roleCardLowerContent: {
    position: "absolute",
    zIndex: 3,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: "rgba(4, 10, 19, 0.99)",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  roleCardDescriptionArea: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  roleCardDescription: {
    width: "100%",
    color: "#1597FF",
    fontSize: 10.5,
    lineHeight: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  roleUnifiedBorder: {
    position: "absolute",
    zIndex: 4,
    borderWidth: 2,
    borderColor: "#FF9700",
    borderRadius: 18,
    shadowColor: "#FF8A00",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.62,
    shadowRadius: 8,
    elevation: 6,
  },
  roleExtendedButton: {
    width: "100%",
    minHeight: 46,
    flexShrink: 0,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#16A34A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  roleExtendedButtonText: {
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "900",
    letterSpacing: 0.25,
    textAlign: "center",
  },
  roleExtendedButtonArrow: {
    position: "absolute",
    right: 12,
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
  customerHotspotPressed: {
    backgroundColor: "rgba(37, 99, 235, 0.16)",
  },
  driverHotspotPressed: {
    backgroundColor: "rgba(255, 107, 0, 0.16)",
  },
  signInHotspot: {
    position: "absolute",
    zIndex: 3,
    borderRadius: 16,
  },
  signInHotspotPressed: {
    backgroundColor: "rgba(34, 197, 94, 0.18)",
  },
  roleBackButton: {
    position: "absolute",
    zIndex: 5,
    width: 76,
    minHeight: 34,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#4ADE80",
    backgroundColor: "rgba(19, 29, 46, 0.96)",
    alignItems: "center",
    justifyContent: "center",
  },
  roleBackText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  forgotPasswordContent: {
    flexGrow: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 28,
    backgroundColor: "#020713",
  },
  forgotPasswordTopRow: {
    width: "100%",
    maxWidth: 470,
    alignItems: "flex-start",
  },
  forgotPasswordBackButton: {
    width: 82,
    minHeight: 36,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#4ADE80",
    backgroundColor: "#131D2E",
    alignItems: "center",
    justifyContent: "center",
  },
  forgotPasswordBackText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },
  forgotPasswordLogo: {
    width: 280,
    maxWidth: "88%",
    height: 165,
    marginTop: 6,
  },
  forgotPasswordTitle: {
    color: "#22C55E",
    fontSize: 30,
    lineHeight: 35,
    fontWeight: "900",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  forgotPasswordTitleOrange: {
    color: "#FF6B00",
    fontSize: 30,
    lineHeight: 35,
    fontWeight: "900",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  forgotPasswordSubtitle: {
    maxWidth: 410,
    marginTop: 10,
    color: "#22C55E",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  forgotPasswordSubtitleBrand: {
    color: "#FF6B00",
    fontWeight: "900",
  },
  forgotPasswordCard: {
    width: "100%",
    maxWidth: 470,
    marginTop: 22,
    padding: 18,
    borderWidth: 2,
    borderColor: "#1677EA",
    borderRadius: 22,
    backgroundColor: "#091422",
    shadowColor: "#1677EA",
    shadowOpacity: 0.32,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  forgotPasswordFieldLabel: {
    marginBottom: 7,
    color: "#1677EA",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  forgotPasswordInput: {
    width: "100%",
    minHeight: 50,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: "#22C55E",
    borderRadius: 12,
    backgroundColor: "#050D19",
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  forgotPasswordSendButton: {
    width: "100%",
    minHeight: 52,
    marginTop: 16,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
  },
  forgotPasswordSendText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.8,
    textAlign: "center",
  },
  forgotPasswordConfirmation: {
    width: "100%",
    marginTop: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: "#22C55E",
    borderRadius: 12,
    backgroundColor: "#102A20",
  },
  forgotPasswordConfirmationTitle: {
    color: "#4ADE80",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.8,
    textAlign: "center",
  },
  forgotPasswordConfirmationText: {
    marginTop: 6,
    color: "#EAF2FC",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  customerSignUpContent: {
    flexGrow: 1,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 28,
    backgroundColor: "#020713",
  },
  customerSignUpTopRow: {
    width: "100%",
    alignItems: "flex-start",
  },
  customerSignUpBackButton: {
    width: 82,
    minHeight: 36,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#4ADE80",
    backgroundColor: "#131D2E",
    alignItems: "center",
    justifyContent: "center",
  },
  customerSignUpBackText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },
  customerSignUpLogo: {
    width: 270,
    maxWidth: "86%",
    height: 145,
    marginTop: 2,
  },
  customerSignUpTitle: {
    color: "#22C55E",
    fontSize: 27,
    lineHeight: 32,
    fontWeight: "900",
    letterSpacing: 1.3,
    textAlign: "center",
  },
  customerSignUpTitleOrange: {
    color: "#FF6B00",
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "900",
    letterSpacing: 1.1,
    textAlign: "center",
  },
  customerSignUpSubtitle: {
    maxWidth: 410,
    marginTop: 8,
    color: "#22C55E",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "800",
    textAlign: "center",
  },
  customerSignUpSubtitleBrand: {
    color: "#FF6B00",
    fontWeight: "900",
  },
  driverSignUpTitle: {
    color: "#22C55E",
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "900",
    letterSpacing: 1.1,
    textAlign: "center",
  },
  driverSignUpSubtitle: {
    maxWidth: 410,
    marginTop: 8,
    color: "#1677EA",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "800",
    textAlign: "center",
  },
  customerSignUpCard: {
    width: "100%",
    maxWidth: 470,
    marginTop: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#1677EA",
    borderRadius: 22,
    backgroundColor: "#091422",
    shadowColor: "#1677EA",
    shadowOpacity: 0.32,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  customerSignUpFieldLabel: {
    marginBottom: 6,
    color: "#1677EA",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  customerSignUpInput: {
    width: "100%",
    minHeight: 48,
    marginBottom: 14,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: "#22C55E",
    borderRadius: 12,
    backgroundColor: "#050D19",
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  driverPasswordRow: {
    width: "100%",
    minHeight: 48,
    marginBottom: 2,
    borderWidth: 2,
    borderColor: "#22C55E",
    borderRadius: 12,
    backgroundColor: "#050D19",
    flexDirection: "row",
    alignItems: "center",
  },
  driverPasswordInput: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 14,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  driverPasswordToggle: {
    minWidth: 66,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  driverPasswordToggleText: {
    color: "#4ADE80",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  customerPaymentRow: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },
  customerPaymentButton: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: "#1677EA",
    borderRadius: 12,
    backgroundColor: "#050D19",
    alignItems: "center",
    justifyContent: "center",
  },
  customerPaymentButtonSelected: {
    borderColor: "#22C55E",
    backgroundColor: "#102A20",
  },
  customerPaymentText: {
    color: "#AFC2D8",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  customerPaymentTextSelected: {
    color: "#4ADE80",
  },
  customerSignUpContinueButton: {
    width: "100%",
    maxWidth: 470,
    minHeight: 52,
    marginTop: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: "#16A34A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  customerSignUpContinueText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  customerSignUpContinueArrow: {
    position: "absolute",
    right: 18,
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },
  driverExistingAccount: {
    minHeight: 42,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  driverExistingAccountText: {
    color: "#1677EA",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  driverExistingAccountLink: {
    color: "#FF6B00",
    fontWeight: "900",
  },
  driverProfileContent: {
    flexGrow: 1,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 28,
    backgroundColor: "#020713",
  },
  driverProfileLogo: {
    width: 270,
    maxWidth: "86%",
    height: 145,
  },
  driverProfileTitle: {
    color: "#22C55E",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: 1.2,
    textAlign: "center",
  },
  driverProfileSubtitle: {
    maxWidth: 410,
    marginTop: 8,
    marginBottom: 16,
    color: "#1677EA",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "800",
    textAlign: "center",
  },
  driverProfilePanel: {
    width: "100%",
    maxWidth: 470,
    marginBottom: 15,
    padding: 15,
    borderWidth: 2,
    borderColor: "#1677EA",
    borderRadius: 20,
    backgroundColor: "#091422",
    shadowColor: "#1677EA",
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  driverProfileSectionTitle: {
    color: "#FF6B00",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  driverProfileHint: {
    marginTop: 4,
    marginBottom: 11,
    color: "#AFC2D8",
    fontSize: 13,
    fontWeight: "600",
  },
  driverProfileOptions: {
    gap: 9,
  },
  driverProfileOption: {
    width: "100%",
    minHeight: 48,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderWidth: 2,
    borderColor: "#26354D",
    borderRadius: 12,
    backgroundColor: "#050D19",
    justifyContent: "center",
  },
  driverProfileOptionSelected: {
    borderColor: "#22C55E",
    backgroundColor: "#102A20",
  },
  driverProfileOptionText: {
    color: "#F8FAFC",
    fontSize: 15,
    fontWeight: "800",
  },
  driverProfileOptionTextSelected: {
    color: "#4ADE80",
  },
  driverProfileOptionTime: {
    marginTop: 2,
    color: "#AFC2D8",
    fontSize: 12,
    fontWeight: "600",
  },
  driverProfileActions: {
    width: "100%",
    maxWidth: 470,
    flexDirection: "row",
    gap: 10,
  },
  driverProfileBackButton: {
    flex: 0.42,
    minHeight: 52,
    borderWidth: 2,
    borderColor: "#4ADE80",
    borderRadius: 14,
    backgroundColor: "#131D2E",
    alignItems: "center",
    justifyContent: "center",
  },
  driverProfileContinueButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
  },
  driverProfileActionText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1,
  },
  signInPageInput: {
    position: "absolute",
    zIndex: 4,
    paddingHorizontal: 12,
    paddingVertical: 0,
    borderWidth: 0,
    borderRadius: 7,
    backgroundColor: "rgba(4, 14, 28, 0.98)",
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  customerHomeInput: {
    position: "absolute",
    zIndex: 5,
    paddingHorizontal: 8,
    paddingVertical: 0,
    borderWidth: 0,
    borderRadius: 7,
    backgroundColor: "rgba(6, 20, 38, 0.98)",
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  driverSecondaryScreen: {
    flex: 1,
    backgroundColor: "#07101E",
  },
  driverSecondaryContent: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 24,
    backgroundColor: "#07101E",
  },
  driverSecondaryTitle: {
    color: "#FF8A00",
    fontSize: 29,
    lineHeight: 35,
    fontWeight: "900",
    letterSpacing: 1.4,
    textAlign: "center",
  },
  driverSecondarySubtitle: {
    marginTop: 7,
    marginBottom: 20,
    color: "#22C55E",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "800",
    textAlign: "center",
  },
  driverSegmentRow: {
    width: "100%",
    flexDirection: "row",
    gap: 9,
    marginBottom: 14,
  },
  driverSegmentButton: {
    flex: 1,
    minHeight: 46,
    borderWidth: 1.5,
    borderColor: "#26354D",
    borderRadius: 12,
    backgroundColor: "#131D2E",
    alignItems: "center",
    justifyContent: "center",
  },
  driverSegmentButtonSelectedOrange: {
    borderColor: "#FF8A00",
    backgroundColor: "#FF8A00",
  },
  driverSegmentButtonSelectedBlue: {
    borderColor: "#2563EB",
    backgroundColor: "#2563EB",
  },
  driverSegmentText: {
    color: "#F8FAFC",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  driverSegmentTextSelected: {
    color: "#FFFFFF",
  },
  driverEarningsHero: {
    width: "100%",
    paddingHorizontal: 18,
    paddingVertical: 23,
    borderWidth: 1.5,
    borderColor: "#16A34A",
    borderRadius: 18,
    backgroundColor: "#0A2819",
    alignItems: "center",
  },
  driverEarningsHeroLabel: {
    color: "#86EFAC",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },
  driverEarningsAmount: {
    marginTop: 8,
    color: "#FFFFFF",
    fontSize: 43,
    lineHeight: 50,
    fontWeight: "900",
  },
  driverEarningsPayout: {
    marginTop: 2,
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "600",
  },
  driverStatRow: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    marginBottom: 20,
  },
  driverStatCard: {
    flex: 1,
    minHeight: 86,
    padding: 14,
    borderWidth: 1,
    borderColor: "#26354D",
    borderRadius: 14,
    backgroundColor: "#131D2E",
  },
  driverStatLabel: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "700",
  },
  driverStatValue: {
    marginTop: 6,
    color: "#22C55E",
    fontSize: 22,
    fontWeight: "900",
  },
  driverSectionTitle: {
    width: "100%",
    marginTop: 4,
    marginBottom: 10,
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },
  driverListCard: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#26354D",
    borderRadius: 16,
    backgroundColor: "#131D2E",
    overflow: "hidden",
  },
  driverEarningsRow: {
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#26354D",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  driverListLastRow: {
    borderBottomWidth: 0,
  },
  driverListPrimary: {
    color: "#F8FAFC",
    fontSize: 15,
    fontWeight: "800",
  },
  driverListSecondary: {
    marginTop: 4,
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
  },
  driverListAmount: {
    color: "#22C55E",
    fontSize: 18,
    fontWeight: "900",
  },
  driverTripList: {
    width: "100%",
    gap: 10,
  },
  driverTripCard: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#26354D",
    borderRadius: 16,
    backgroundColor: "#131D2E",
  },
  driverTripTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  driverTripDate: {
    flex: 1,
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "900",
  },
  driverTripEarnings: {
    color: "#22C55E",
    fontSize: 19,
    fontWeight: "900",
  },
  driverRouteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  driverPickupDot: {
    width: 10,
    height: 10,
    marginTop: 4,
    borderRadius: 5,
    backgroundColor: "#22C55E",
  },
  driverDropoffDot: {
    width: 10,
    height: 10,
    marginTop: 4,
    borderRadius: 5,
    backgroundColor: "#FF8A00",
  },
  driverRouteText: {
    flex: 1,
    color: "#E2E8F0",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
  },
  driverTripMeta: {
    marginTop: 3,
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
  },
  driverEmptyCard: {
    width: "100%",
    minHeight: 145,
    padding: 20,
    borderWidth: 1,
    borderColor: "#26354D",
    borderRadius: 16,
    backgroundColor: "#131D2E",
    alignItems: "center",
    justifyContent: "center",
  },
  driverEmptyText: {
    color: "#94A3B8",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  driverAccountFields: {
    width: "100%",
    marginBottom: 17,
  },
  driverAccountLabel: {
    marginBottom: 6,
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  driverAccountInput: {
    width: "100%",
    minHeight: 48,
    marginBottom: 11,
    paddingHorizontal: 13,
    borderWidth: 1.5,
    borderColor: "#22C55E",
    borderRadius: 12,
    backgroundColor: "#0B1220",
    color: "#F8FAFC",
    fontSize: 15,
    fontWeight: "700",
  },
  driverAccountTwoColumn: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },
  driverAccountHalfField: {
    flex: 1,
    minWidth: 0,
  },
  driverAccountSelector: {
    width: "100%",
    minHeight: 48,
    marginBottom: 17,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: "#22C55E",
    borderRadius: 12,
    backgroundColor: "#0B1220",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  driverAccountSelectorText: {
    flex: 1,
    color: "#F8FAFC",
    fontSize: 13,
    fontWeight: "700",
  },
  driverAccountSelectorArrow: {
    color: "#22C55E",
    fontSize: 18,
    fontWeight: "900",
  },
  driverAccountSaveButton: {
    width: "100%",
    minHeight: 54,
    marginTop: 4,
    borderRadius: 14,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
  },
  driverAccountSaveText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1,
  },
  driverBottomNavigation: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: 6,
    paddingTop: 9,
    paddingBottom: 11,
    borderTopWidth: 1,
    borderTopColor: "#26354D",
    backgroundColor: "#0B1220",
    flexDirection: "row",
  },
  driverBottomTab: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  driverBottomTabSelected: {
    backgroundColor: "#2A1A08",
  },
  driverBottomTabText: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "700",
  },
  driverBottomTabTextSelected: {
    color: "#FF8A00",
    fontWeight: "900",
  },
  homeHotspot: {
    position: "absolute",
    zIndex: 5,
    borderRadius: 14,
  },
  homeGreenIndicator: {
    position: "absolute",
    right: 8,
    top: 8,
    borderRadius: 9,
    backgroundColor: "#16A34A",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  homeRedIndicator: {
    position: "absolute",
    right: 8,
    top: 8,
    borderRadius: 9,
    backgroundColor: "#B91C1C",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  homeIndicatorText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
  },
  customerNotice: {
    position: "absolute",
    zIndex: 7,
    minHeight: 34,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#4ADE80",
    backgroundColor: "rgba(19, 29, 46, 0.97)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  customerNoticeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  signInPageHotspot: {
    position: "absolute",
    zIndex: 5,
    borderRadius: 14,
  },
  signInBackButton: {
    position: "absolute",
    zIndex: 6,
    width: 82,
    minHeight: 36,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#4ADE80",
    backgroundColor: "rgba(19, 29, 46, 0.97)",
    alignItems: "center",
    justifyContent: "center",
  },
  signInBackText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },
  blueHotspotPressed: {
    backgroundColor: "rgba(37, 99, 235, 0.18)",
  },
  greenHotspotPressed: {
    backgroundColor: "rgba(34, 197, 94, 0.18)",
  },
  redHotspotPressed: {
    backgroundColor: "rgba(220, 38, 38, 0.2)",
  },
  orangeHotspotPressed: {
    backgroundColor: "rgba(255, 107, 0, 0.18)",
  },
  hotspotPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
  },
  driverNavigationCover: {
    position: "absolute",
    paddingHorizontal: 12,
    paddingVertical: 3,
    backgroundColor: "#020713",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  pageFourNavigationCover: {
    position: "absolute",
    paddingHorizontal: 10,
    paddingVertical: 1,
    backgroundColor: "#020713",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  pageFourBackButton: {
    width: 104,
    minHeight: 32,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#4ADE80",
    backgroundColor: "#131D2E",
    alignItems: "center",
    justifyContent: "center",
  },
  pageFourNextButton: {
    width: 104,
    minHeight: 32,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#4ADE80",
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
  },
  smallBackButton: {
    width: 118,
    minHeight: 40,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#4ADE80",
    backgroundColor: "#131D2E",
    alignItems: "center",
    justifyContent: "center",
  },
  smallNextButton: {
    width: 118,
    minHeight: 40,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#4ADE80",
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
  },
  smallButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1.3,
  },
  smallNextArrow: {
    position: "absolute",
    right: 12,
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
  nextArea: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 18,
    backgroundColor: "rgba(3, 8, 15, 0.88)",
  },
  nextButton: {
    width: 154,
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#4ADE80",
    backgroundColor: "#16A34A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#22C55E",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  nextArrow: {
    position: "absolute",
    right: 14,
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "700",
  },
  buttonPressed: {
    opacity: 0.74,
    transform: [{ scale: 0.985 }],
  },
  applicationContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 34,
  },
  applicationLogo: {
    alignSelf: "center",
    width: 245,
    height: 145,
  },
  applicationTitle: {
    marginTop: 4,
    color: "#22C55E",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 1.2,
  },
  applicationSubtitle: {
    marginTop: 7,
    color: "#2F8CFF",
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  applicationBrand: {
    color: "#FF6B00",
    fontWeight: "900",
  },
  demoNote: {
    marginTop: 8,
    marginBottom: 14,
    color: "#9FB2C8",
    fontSize: 13,
    textAlign: "center",
  },
  applicationSection: {
    marginTop: 14,
    padding: 15,
    borderWidth: 1.5,
    borderColor: "#1677EA",
    borderRadius: 18,
    backgroundColor: "#091220",
  },
  sectionTitle: {
    marginBottom: 12,
    color: "#22C55E",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    marginBottom: 6,
    color: "#2F8CFF",
    fontSize: 14,
    fontWeight: "800",
  },
  applicationInput: {
    minHeight: 48,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: "#1D75D8",
    borderRadius: 12,
    backgroundColor: "#020713",
    color: "#FFFFFF",
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  choiceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  choiceButton: {
    minWidth: 104,
    minHeight: 42,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: "#1D75D8",
    borderRadius: 11,
    backgroundColor: "#131D2E",
    alignItems: "center",
    justifyContent: "center",
  },
  shiftButton: {
    minWidth: 132,
    minHeight: 42,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: "#1D75D8",
    borderRadius: 11,
    backgroundColor: "#131D2E",
    alignItems: "center",
    justifyContent: "center",
  },
  choiceButtonSelected: {
    borderColor: "#4ADE80",
    backgroundColor: "#16A34A",
  },
  choiceButtonText: {
    color: "#BBD7FA",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  choiceButtonTextSelected: {
    color: "#FFFFFF",
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: 10,
  },
  halfField: {
    flex: 1,
  },
  documentButton: {
    minHeight: 52,
    marginBottom: 9,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: "#1D75D8",
    borderRadius: 12,
    backgroundColor: "#020713",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  documentButtonSelected: {
    borderColor: "#4ADE80",
    backgroundColor: "#0D241B",
  },
  documentName: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  documentAction: {
    color: "#2F8CFF",
    fontSize: 11,
    fontWeight: "900",
  },
  documentActionSelected: {
    color: "#4ADE80",
  },
  confirmationRow: {
    marginTop: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#26354D",
    borderRadius: 13,
    backgroundColor: "#0D1726",
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  checkbox: {
    width: 25,
    height: 25,
    borderWidth: 2,
    borderColor: "#2F8CFF",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    borderColor: "#4ADE80",
    backgroundColor: "#16A34A",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
  confirmationText: {
    flex: 1,
    color: "#D7E4F3",
    fontSize: 13,
    lineHeight: 19,
  },
  applicationNavigation: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  applicationBackButton: {
    width: 132,
    minHeight: 44,
    borderWidth: 2,
    borderColor: "#4ADE80",
    borderRadius: 13,
    backgroundColor: "#131D2E",
    alignItems: "center",
    justifyContent: "center",
  },
  applicationNextButton: {
    width: 132,
    minHeight: 44,
    borderWidth: 2,
    borderColor: "#4ADE80",
    borderRadius: 13,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
  },
  applicationButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  applicationNextArrow: {
    position: "absolute",
    right: 12,
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
  thankYouScreen: {
    flex: 1,
    paddingHorizontal: 22,
    backgroundColor: "#050A12",
    alignItems: "center",
    justifyContent: "center",
  },
  thankYouCard: {
    width: "100%",
    maxWidth: 500,
    paddingHorizontal: 22,
    paddingVertical: 30,
    borderWidth: 2,
    borderColor: "#1677EA",
    borderRadius: 24,
    backgroundColor: "#091220",
    alignItems: "center",
  },
  thankYouLogo: {
    width: 280,
    maxWidth: "90%",
    height: 170,
  },
  thankYouTitle: {
    marginTop: 10,
    color: "#22C55E",
    fontSize: 30,
    lineHeight: 37,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 1.1,
  },
  thankYouBrand: {
    marginTop: 10,
    color: "#FF6B00",
    fontSize: 27,
    fontWeight: "900",
  },
  thankYouLine: {
    width: 110,
    height: 4,
    marginTop: 18,
    borderRadius: 2,
    backgroundColor: "#16A34A",
  },
  thankYouMessage: {
    maxWidth: 390,
    marginTop: 20,
    marginBottom: 28,
    color: "#EAF2FC",
    fontSize: 17,
    lineHeight: 26,
    textAlign: "center",
  },
  checkpointScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0B1220",
    paddingHorizontal: 28,
  },
  checkpointLogo: {
    width: 310,
    maxWidth: "88%",
    height: 180,
    marginBottom: 30,
  },
  checkpointTitle: {
    color: "#16A34A",
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 2,
  },
  checkpointText: {
    color: "#F8FAFC",
    fontSize: 19,
    marginTop: 10,
    marginBottom: 36,
  },
  backButton: {
    width: 132,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#16A34A",
    backgroundColor: "#131D2E",
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  driverArrivedScreen: {
    flex: 1,
    backgroundColor: "#0B1220",
  },
  driverArrivedMap: {
    height: "42%",
    minHeight: 245,
    position: "relative",
  },
  driverArrivedPill: {
    position: "absolute",
    top: 14,
    right: 14,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(11,18,32,0.92)",
    borderWidth: 1,
    borderColor: "#2563EB",
  },
  driverArrivedPillText: {
    color: "#60A5FA",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  driverArrivedContent: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
  },
  driverArrivedTitle: {
    color: "#F8FAFC",
    fontSize: 25,
    fontWeight: "900",
  },
  driverArrivedSubtitle: {
    color: "#A9B6C9",
    fontSize: 15,
    marginTop: 4,
    marginBottom: 15,
  },
  driverWaitCard: {
    alignItems: "center",
    backgroundColor: "#131D2E",
    borderColor: "#26354D",
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 13,
  },
  driverWaitLabel: {
    color: "#A9B6C9",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  driverWaitTimer: {
    color: "#F8FAFC",
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginTop: 2,
  },
  driverWaitStatus: {
    color: "#4ADE80",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 1,
  },
  driverWaitStatusCharging: {
    color: "#F59E0B",
  },
  driverArrivedRiderCard: {
    alignItems: "center",
    borderBottomColor: "#26354D",
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingVertical: 14,
  },
  driverArrivedAvatar: {
    alignItems: "center",
    backgroundColor: "#26354D",
    borderRadius: 23,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  driverArrivedAvatarText: {
    color: "#93C5FD",
    fontSize: 14,
    fontWeight: "900",
  },
  driverArrivedRiderDetails: {
    flex: 1,
    marginLeft: 12,
  },
  driverArrivedRiderName: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "900",
  },
  driverArrivedAddress: {
    color: "#A9B6C9",
    fontSize: 12,
    marginTop: 3,
  },
  driverArrivedContactRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 13,
  },
  driverArrivedContactButton: {
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
  },
  driverArrivedContactText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  driverArrivedStartButton: {
    alignItems: "center",
    backgroundColor: "#16A34A",
    borderRadius: 13,
    justifyContent: "center",
    marginTop: 13,
    minHeight: 50,
  },
  driverArrivedStartText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  driverArrivedCancelButton: {
    alignItems: "center",
    backgroundColor: "#131D2E",
    borderColor: "#DC2626",
    borderRadius: 13,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 9,
    minHeight: 46,
  },
  driverArrivedCancelText: {
    color: "#F87171",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.9,
  },
  driverArrivedChargeNote: {
    color: "#A9B6C9",
    fontSize: 12,
    marginTop: 10,
    textAlign: "center",
  },
  liveTripScreen: {
    backgroundColor: "#0B1220",
    flex: 1,
  },
  liveTripMap: {
    height: "48%",
    minHeight: 280,
    position: "relative",
  },
  liveMapPill: {
    backgroundColor: "rgba(11,18,32,0.92)",
    borderColor: "#2563EB",
    borderRadius: 999,
    borderWidth: 1,
    left: 14,
    paddingHorizontal: 13,
    paddingVertical: 7,
    position: "absolute",
    top: 14,
  },
  liveMapPillText: {
    color: "#60A5FA",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.9,
  },
  liveTripPanel: {
    backgroundColor: "#0B1220",
    borderTopColor: "#26354D",
    borderTopWidth: 1,
    paddingBottom: 18,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  liveTripEyebrow: {
    color: "#4ADE80",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  liveTripTitle: {
    color: "#F8FAFC",
    fontSize: 23,
    fontWeight: "900",
    marginTop: 3,
  },
  liveTripAddress: {
    color: "#A9B6C9",
    fontSize: 13,
    marginTop: 3,
  },
  liveTripStatsRow: {
    alignItems: "center",
    backgroundColor: "#131D2E",
    borderColor: "#26354D",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 14,
    paddingVertical: 11,
  },
  liveTripStat: {
    alignItems: "center",
    flex: 1,
  },
  liveTripStatValue: {
    color: "#F8FAFC",
    fontSize: 17,
    fontWeight: "900",
  },
  liveTripStatLabel: {
    color: "#7890AD",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginTop: 2,
  },
  liveTripStatDivider: {
    backgroundColor: "#26354D",
    height: 30,
    width: 1,
  },
  liveTripContactRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 11,
  },
  liveTripContactButton: {
    alignItems: "center",
    backgroundColor: "#131D2E",
    borderColor: "#2563EB",
    borderRadius: 11,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 40,
  },
  liveTripContactText: {
    color: "#93C5FD",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  liveTripButtonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  liveTripSecondaryButton: {
    alignItems: "center",
    backgroundColor: "#131D2E",
    borderColor: "#26354D",
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 48,
    width: 92,
  },
  liveTripSecondaryText: {
    color: "#F8FAFC",
    fontSize: 13,
    fontWeight: "900",
  },
  liveTripPrimaryButton: {
    alignItems: "center",
    backgroundColor: "#16A34A",
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  liveTripPrimaryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  demoRideOfferCard: {
    backgroundColor: "rgba(11,18,32,0.98)",
    borderColor: "#2563EB",
    borderRadius: 18,
    borderWidth: 2,
    bottom: 92,
    left: 18,
    padding: 16,
    position: "absolute",
    right: 18,
    zIndex: 60,
  },
  demoRideOfferEyebrow: {
    color: "#4ADE80",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  demoRideOfferTitle: {
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 4,
  },
  demoRideOfferAddress: {
    color: "#A9B6C9",
    fontSize: 12,
    marginTop: 3,
  },
  demoRideOfferDetails: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  demoRideOfferDetailText: {
    color: "#93C5FD",
    fontSize: 12,
    fontWeight: "800",
  },
  demoRideOfferFare: {
    color: "#4ADE80",
    fontSize: 18,
    fontWeight: "900",
    marginLeft: "auto",
  },
  demoRideOfferAccept: {
    alignItems: "center",
    backgroundColor: "#16A34A",
    borderRadius: 12,
    justifyContent: "center",
    marginTop: 13,
    minHeight: 48,
  },
  demoRideOfferAcceptText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.9,
  },
  demoNavigationButton: {
    position: "absolute",
    zIndex: 20,
    borderWidth: 2,
    borderColor: "#4ADE80",
    borderRadius: 11,
    backgroundColor: "rgba(19, 29, 46, 0.97)",
    alignItems: "center",
    justifyContent: "center",
  },
  demoNavigationNextButton: {
    backgroundColor: "rgba(22, 163, 74, 0.97)",
  },
  demoNavigationText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },
  demoNavigationArrow: {
    position: "absolute",
    right: 8,
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
  },
});
