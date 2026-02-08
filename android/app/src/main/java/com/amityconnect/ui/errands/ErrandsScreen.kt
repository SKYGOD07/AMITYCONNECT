package com.amityconnect.ui.errands

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
import com.amityconnect.data.model.Errand
import com.amityconnect.ui.theme.*
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ErrandsScreen(
    onNavigateBack: () -> Unit,
    onNavigateToCreate: () -> Unit
) {
    var showContent by remember { mutableStateOf(false) }
    
    val sampleErrands = remember {
        listOf(
            Errand(
                id = "1",
                requesterId = "user1",
                requesterName = "Ankit R.",
                title = "Pick up notes from library",
                description = "Need someone to pick up my reserved materials from the central library.",
                location = "Central Library, Block A",
                reward = "Chai + Snacks"
            ),
            Errand(
                id = "2",
                requesterId = "user2",
                requesterName = "Meera P.",
                title = "Collect laundry",
                description = "Please collect my laundry from the campus dry cleaners.",
                location = "Dry Cleaners, Gate 2",
                reward = "₹50"
            ),
            Errand(
                id = "3",
                requesterId = "user3",
                requesterName = "Vivek K.",
                title = "Print assignment",
                description = "Print 10 pages of my assignment, PDF will be shared.",
                location = "Printing Shop, Block C",
                reward = "Coffee"
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
                title = { Text("Errands Marketplace", fontWeight = FontWeight.Bold) },
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
                containerColor = Green500
            ) {
                Icon(Icons.Default.Add, contentDescription = "Create errand", tint = androidx.compose.ui.graphics.Color.White)
            }
        }
    ) { paddingValues ->
        AnimatedVisibility(
            visible = showContent,
            enter = fadeIn() + slideInVertically { 40 }
        ) {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(sampleErrands) { errand ->
                    ErrandCard(errand = errand)
                }
            }
        }
    }
}

@Composable
fun ErrandCard(errand: Errand) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = Green500.copy(alpha = 0.08f)
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
                        color = Green500,
                        modifier = Modifier.size(40.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
                            Text(
                                text = errand.requesterName.first().toString(),
                                color = androidx.compose.ui.graphics.Color.White,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = errand.requesterName,
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.SemiBold
                        )
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.LocationOn,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(2.dp))
                            Text(
                                text = errand.location,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
                
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Orange500.copy(alpha = 0.15f)
                ) {
                    Text(
                        text = errand.reward,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = Orange500
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Text(
                text = errand.title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = errand.description,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
            ) {
                OutlinedButton(
                    onClick = { /* TODO: View details */ },
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.padding(end = 8.dp)
                ) {
                    Text("Details")
                }
                
                Button(
                    onClick = { /* TODO: Accept errand */ },
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Green500)
                ) {
                    Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Accept")
                }
            }
        }
    }
}
