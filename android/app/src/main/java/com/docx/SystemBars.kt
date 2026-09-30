package com.docx

import android.graphics.Color
import android.os.Build
import android.view.View
import android.view.Window
import android.view.WindowManager
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsControllerCompat

/**
 * Draws app content behind a transparent navigation bar so the screen
 * background fills the gesture / 3-button area instead of a white strip.
 * Icon contrast is applied separately and does not change layout insets.
 */
object SystemBars {
  fun apply(window: Window, lightIcons: Boolean? = null) {
    WindowCompat.setDecorFitsSystemWindows(window, false)
    window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS)
    @Suppress("DEPRECATION")
    window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION)
    @Suppress("DEPRECATION")
    window.statusBarColor = Color.TRANSPARENT
    @Suppress("DEPRECATION")
    window.navigationBarColor = Color.TRANSPARENT
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      window.navigationBarDividerColor = Color.TRANSPARENT
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      window.isStatusBarContrastEnforced = false
      window.isNavigationBarContrastEnforced = false
    }

    val content = window.decorView.findViewById<View>(android.R.id.content)
    content?.setPadding(0, 0, 0, 0)

    if (lightIcons != null) {
      val controller = WindowInsetsControllerCompat(window, window.decorView)
      controller.isAppearanceLightStatusBars = !lightIcons
      controller.isAppearanceLightNavigationBars = !lightIcons
    }

    ViewCompat.requestApplyInsets(window.decorView)
  }
}
