package com.amityconnect.ui.rides

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.amityconnect.data.model.Ride
import com.amityconnect.ui.theme.*
import com.google.firebase.Timestamp
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RidesScreen(
    onNavigateBack: () -> Unit,
    onNavigateToCreate: () -> Unit
) {
    var selectedTab by remember { mutableStateOf(0) }
    var showContent by remember { mutableStateOf(false) }
    
    // Sample data for demonstration
    val sampleRides = remember {
        listOf(
            Ride(
                id = "1",
                hostId = "user1",
                hostName = "Priya S.",
                type = "OFFER",
                origin = "Amity Gwalior Campus",
                destination = "Gwalior Bus Stand",
                departureTime = Timestamp.now(),
                seatsAvailable = 3,
                status = "OPEN"
            ),
            Ride(
                id = "2",
                hostId = "user2",
                hostName = "Rahul M.",
                type = "OFFER",
                origin = "Gwalior Junction",
                destination = "Amity Gwalior Campus",
                departureTime = Timestamp.now(),
                seatsAvailable = 2,
                status = "OPEN"
            ),
            Ride(
                id = "3",
                hostId = "user3",
                hostName = "Sneha K.",
                type = "REQUEST",
                origin = "Amity Gwalior Campus",
                destination = "City Center Mall",
                departureTime = Timestamp.now(),
                seatsAvailable = 1,
                status = "OPEN"
            )
        )
    }
    
    LaunchedEffect(Unit) {
        delay(100)
        showContent = true
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Ride Board", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onNavigateToCreate,
                containerColor = Blue500
            ) {
                Icon(Icons.Default.Add, contentDescription = "Create ride", tint = androidx.compose.ui.graphics.Color.White)
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Tab Row
            TabRow(
                selectedTabIndex = selectedTab,
                modifier = Modifier.padding(horizontal = 16.dp),
                containerColor = MaterialTheme.colorScheme.background
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = { Text("All") }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = { Text("Offering") }
                )
                Tab(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    text = { Text("Requesting") }
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            AnimatedVisibility(
                visible = showContent,
                enter = fadeIn() + slideInVertically { 40 }
            ) {
                val filteredRides = when (selectedTab) {
                    1 -> sampleRides.filter { it.type == "OFFER" }
                    2 -> sampleRides.filter { it.type == "REQUEST" }
                    else -> sampleRides
                }
                
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(filteredRides) { ride ->
                        RideCard(ride = ride)
                    }
                }
            }
        }
    }
}

@Composable
fun RideCard(ride: Ride) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (ride.type == "OFFER") Blue500.copy(alpha = 0.08f) else Orange500.copy(alpha = 0.08f)
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        shape = CircleShape,
                        color = if (ride.type == "OFFER") Blue500 else Orange500,
                        modifier = Modifier.size(40.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
                            Text(
                                text = ride.hostName.first().toString(),
                                color = androidx.compose.ui.graphics.Color.White,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = ride.hostName,
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = if (ride.type == "OFFER") "Offering a ride" else "Requesting a ride",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
                
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = if (ride.type == "OFFER") Blue500.copy(alpha = 0.15f) else Orange500.copy(alpha = 0.15f)
                ) {
                    Text(
                        text = if (ride.type == "OFFER") "OFFER" else "REQUEST",
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = if (ride.type == "OFFER") Blue500 else Orange500
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Route
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.TripOrigin,
                            contentDescription = null,
                            tint = Green500,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = ride.origin,
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = null,
                            tint = Red500,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = ride.destination,
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Details row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Schedule,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = formatTimestamp(ride.departureTime),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.AirlineSeatReclineNormal,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${ride.seatsAvailable} seats",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                Button(
                    onClick = { /* TODO: Join ride */ },
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (ride.type == "OFFER") Blue500 else Orange500
                    )
                ) {
                    Text("Join", style = MaterialTheme.typography.labelMedium)
                }
            }
        }
    }
}

fun formatTimestamp(timestamp: Timestamp?): String {
    if (timestamp == null) return "TBD"
    val sdf = SimpleDateFormat("MMM d, h:mm a", Locale.getDefault())
    return sdf.format(timestamp.toDate())
}
