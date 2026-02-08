package com.amityconnect.navigation

sealed class Screen(val route: String) {
    object Landing : Screen("landing")
    object Login : Screen("login")
    object Signup : Screen("signup")
    object Home : Screen("home")
    object Rides : Screen("rides")
    object CreateRide : Screen("rides/create")
    object Errands : Screen("errands")
    object CreateErrand : Screen("errands/create")
    object SOS : Screen("sos")
    object Profile : Screen("profile/{userId}") {
        fun createRoute(userId: String) = "profile/$userId"
    }
    object People : Screen("people")
}
