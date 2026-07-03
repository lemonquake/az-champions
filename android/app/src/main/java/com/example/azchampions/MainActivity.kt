package com.example.azchampions

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.example.azchampions.theme.AZChampionsTheme

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    enableEdgeToEdge()
    setContent {
      // Surface uses the game's own background color so the system-bar
      // areas blend with the WebView instead of flashing white/purple.
      AZChampionsTheme { Surface(modifier = Modifier.fillMaxSize(), color = Color(0xFF06070D)) { MainNavigation() } }
    }
  }
}
