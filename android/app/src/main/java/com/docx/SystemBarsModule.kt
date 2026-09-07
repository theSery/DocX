package com.docx

import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class SystemBarsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), LifecycleEventListener {

  init {
    reactContext.addLifecycleEventListener(this)
  }

  override fun getName(): String = NAME

  override fun invalidate() {
    reactApplicationContext.removeLifecycleEventListener(this)
    super.invalidate()
  }

  @ReactMethod
  fun setLightIcons(lightIcons: Boolean) {
    lastLightIcons = lightIcons
    applyToCurrentActivity()
  }

  override fun onHostResume() {
    applyToCurrentActivity()
  }

  override fun onHostPause() = Unit

  override fun onHostDestroy() = Unit

  private fun applyToCurrentActivity() {
    val activity = reactApplicationContext.currentActivity ?: return
    val lightIcons = lastLightIcons
    activity.runOnUiThread {
      SystemBars.apply(activity.window, lightIcons)
    }
  }

  companion object {
    const val NAME = "SystemBars"

    @Volatile
    private var lastLightIcons: Boolean? = true
  }
}
