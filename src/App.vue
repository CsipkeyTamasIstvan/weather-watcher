<template>
  <div id="app">
    <header>
      <h1>WeatherWatcher</h1>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<style>
#app {
  font-family: Inter, Arial, sans-serif;
  max-width: 900px;
  margin: 24px auto;
  padding: 0 16px;
}
header { margin-bottom: 18px; }
</style>