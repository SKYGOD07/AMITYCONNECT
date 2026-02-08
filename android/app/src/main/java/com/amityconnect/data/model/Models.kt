package com.amityconnect.data.model

import com.google.firebase.Timestamp

data class User(
    val uid: String = "",
    val email: String = "",
    val displayName: String = "",
    val photoURL: String = "",
    val role: String = "student", // student, faculty, admin
    val verified: Boolean = false,
    val followersCount: Int = 0,
    val followingCount: Int = 0,
    val ridesShared: Int = 0,
    val errandsCompleted: Int = 0,
    val createdAt: Timestamp? = null
)

data class Ride(
    val id: String = "",
    val hostId: String = "",
    val hostName: String = "",
    val type: String = "OFFER", // OFFER, REQUEST
    val origin: String = "",
    val destination: String = "",
    val departureTime: Timestamp? = null,
    val seatsAvailable: Int = 1,
    val status: String = "OPEN", // OPEN, FILLED, CANCELLED
    val createdAt: Timestamp? = null
)

data class Errand(
    val id: String = "",
    val requesterId: String = "",
    val requesterName: String = "",
    val title: String = "",
    val description: String = "",
    val location: String = "",
    val reward: String = "",
    val status: String = "OPEN", // OPEN, IN_PROGRESS, COMPLETED
    val helperId: String? = null,
    val createdAt: Timestamp? = null
)

data class SOSAlert(
    val id: String = "",
    val userId: String = "",
    val userName: String = "",
    val userPhoto: String = "",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val status: String = "ACTIVE", // ACTIVE, RESOLVED, SPAM
    val resolvedBy: String? = null,
    val createdAt: Timestamp? = null,
    val resolvedAt: Timestamp? = null
)
