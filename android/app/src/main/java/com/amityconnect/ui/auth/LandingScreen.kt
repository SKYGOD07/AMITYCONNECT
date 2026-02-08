package com.amityconnect.ui.auth

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.amityconnect.ui.theme.*
import kotlinx.coroutines.delay

@Composable
fun LandingScreen(
    onNavigateToLogin: () -> Unit,
    onNavigateToSignup: () -> Unit,
    onNavigateToHome: () -> Unit
) {
    var showContent by remember { mutableStateOf(false) }
    var showButtons by remember { mutableStateOf(false) }
    
    LaunchedEffect(Unit) {
        delay(100)
        showContent = true
        delay(500)
        showButtons = true
    }
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Floating background blobs
        FloatingBlobs()
        
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Badge
            AnimatedVisibility(
                visible = showContent,
                enter = fadeIn(tween(600)) + slideInVertically(
                    initialOffsetY = { -40 },
                    animationSpec = tween(600)
                )
            ) {
                Surface(
                    shape = RoundedCornerShape(50),
                    color = Purple500.copy(alpha = 0.15f),
                    modifier = Modifier.padding(bottom = 24.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = null,
                            tint = Purple500,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Amity Gwalior Campus Community",
                            style = MaterialTheme.typography.labelMedium,
                            color = Purple500
                        )
                    }
                }
            }
            
            // Main headline with gradient
            AnimatedVisibility(
                visible = showContent,
                enter = fadeIn(tween(800, delayMillis = 200)) + slideInVertically(
                    initialOffsetY = { 60 },
                    animationSpec = spring(
                        dampingRatio = Spring.DampingRatioMediumBouncy,
                        stiffness = Spring.StiffnessLow
                    )
                )
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    GradientText(
                        text = "Connect.",
                        fontSize = 48.sp,
                        fontWeight = FontWeight.Bold
                    )
                    GradientText(
                        text = "Commute.",
                        fontSize = 48.sp,
                        fontWeight = FontWeight.Bold
                    )
                    GradientText(
                        text = "Assist.",
                        fontSize = 48.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Description
            AnimatedVisibility(
                visible = showContent,
                enter = fadeIn(tween(600, delayMillis = 400))
            ) {
                Text(
                    text = "AmityConnect is a unified app integrating Smart Ride-Sharing, a Peer-to-Peer Marketplace, and Real-Time SOS for safer, connected campus life.",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
            }
            
            Spacer(modifier = Modifier.height(48.dp))
            
            // Buttons
            AnimatedVisibility(
                visible = showButtons,
                enter = fadeIn(tween(400)) + slideInVertically(
                    initialOffsetY = { 40 },
                    animationSpec = tween(400)
                )
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Button(
                        onClick = onNavigateToSignup,
                        modifier = Modifier
                            .fillMaxWidth(0.8f)
                            .height(56.dp),
                        shape = RoundedCornerShape(28.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Purple500
                        )
                    ) {
                        Text("Get Started", fontWeight = FontWeight.SemiBold)
                        Spacer(modifier = Modifier.width(8.dp))
                        Icon(
                            imageVector = Icons.Default.ArrowForward,
                            contentDescription = null,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    
                    OutlinedButton(
                        onClick = onNavigateToLogin,
                        modifier = Modifier
                            .fillMaxWidth(0.8f)
                            .height(56.dp),
                        shape = RoundedCornerShape(28.dp)
                    ) {
                        Text("I already have an account", fontWeight = FontWeight.Medium)
                    }
                }
            }
        }
    }
}

@Composable
fun GradientText(
    text: String,
    fontSize: androidx.compose.ui.unit.TextUnit,
    fontWeight: FontWeight
) {
    val gradientBrush = Brush.linearGradient(
        colors = listOf(GradientStart, GradientMiddle, GradientEnd)
    )
    
    Text(
        text = text,
        style = MaterialTheme.typography.displayMedium.copy(
            fontSize = fontSize,
            fontWeight = fontWeight,
            brush = gradientBrush
        )
    )
}

@Composable
fun FloatingBlobs() {
    Box(modifier = Modifier.fillMaxSize()) {
        // Purple blob top-left
        Box(
            modifier = Modifier
                .offset(x = (-50).dp, y = 100.dp)
                .size(250.dp)
                .blur(80.dp)
                .background(
                    Purple500.copy(alpha = 0.15f),
                    shape = CircleShape
                )
        )
        // Blue blob top-right
        Box(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .offset(x = 50.dp, y = 200.dp)
                .size(300.dp)
                .blur(80.dp)
                .background(
                    Blue500.copy(alpha = 0.1f),
                    shape = CircleShape
                )
        )
        // Pink blob bottom
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .offset(y = 50.dp)
                .size(280.dp)
                .blur(80.dp)
                .background(
                    Color(0xFFEC4899).copy(alpha = 0.1f),
                    shape = CircleShape
                )
        )
    }
}
