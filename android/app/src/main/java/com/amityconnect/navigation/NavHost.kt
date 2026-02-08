package com.amityconnect.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.amityconnect.ui.auth.LoginScreen
import com.amityconnect.ui.auth.SignupScreen
import com.amityconnect.ui.errands.ErrandsScreen
import com.amityconnect.ui.home.HomeScreen
import com.amityconnect.ui.auth.LandingScreen
import com.amityconnect.ui.rides.RidesScreen
import com.amityconnect.ui.sos.SOSScreen

@Composable
fun AmityConnectNavHost(
    navController: NavHostController = rememberNavController()
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Landing.route
    ) {
        composable(Screen.Landing.route) {
            LandingScreen(
                onNavigateToLogin = { navController.navigate(Screen.Login.route) },
                onNavigateToSignup = { navController.navigate(Screen.Signup.route) },
                onNavigateToHome = { 
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Landing.route) { inclusive = true }
                    }
                }
            )
        }
        
        composable(Screen.Login.route) {
            LoginScreen(
                onNavigateToSignup = { navController.navigate(Screen.Signup.route) },
                onLoginSuccess = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Landing.route) { inclusive = true }
                    }
                },
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable(Screen.Signup.route) {
            SignupScreen(
                onNavigateToLogin = { navController.navigate(Screen.Login.route) },
                onSignupSuccess = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Landing.route) { inclusive = true }
                    }
                },
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable(Screen.Home.route) {
            HomeScreen(
                onNavigateToRides = { navController.navigate(Screen.Rides.route) },
                onNavigateToErrands = { navController.navigate(Screen.Errands.route) },
                onNavigateToSOS = { navController.navigate(Screen.SOS.route) },
                onNavigateToProfile = { userId -> 
                    navController.navigate(Screen.Profile.createRoute(userId)) 
                }
            )
        }
        
        composable(Screen.Rides.route) {
            RidesScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToCreate = { navController.navigate(Screen.CreateRide.route) }
            )
        }
        
        composable(Screen.Errands.route) {
            ErrandsScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToCreate = { navController.navigate(Screen.CreateErrand.route) }
            )
        }
        
        composable(Screen.SOS.route) {
            SOSScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}
