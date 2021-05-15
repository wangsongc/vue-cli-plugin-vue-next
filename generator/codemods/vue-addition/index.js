module.exports = function(files, filename) {
  let content = files[filename]
  content = removeEventNative(content)
  content = addTransitionFrom(content)
  content = editVmodel(content)
  files[filename] = content
}

// template
// v-on:event.native => v-on:event
// @event.native => @event
function removeEventNative(content) {
  const reg = new RegExp(
    '(?<=<template>[\\s\\S]*?\\s(?:v-on:|@)\\w+).native(?==[\\s\\S]*?</template>)',
    'g'
  )
  return content.replace(reg, '')
}

function editVmodel(content) {
  const reg = new RegExp(
    '(?<=<template>[\\s\\S]*?\\s)(?:v-bind:|:)\\w+.sync(?==[\\s\\S]*?</template>)',
    'g'
  )
  let resolve = content.match(reg)
  if(resolve?.length) {
    const name =resolve[0].match(/(?<=(?:bind:|:))\w+/g)[0]
    return content.replace(reg, `v-model:${name}`)
  }
  return content
}

// style
// .xxx-enter => .xxx-enter-from
// .xxx-leave => .xxx-leave-from
function addTransitionFrom(content) {
  const reg = new RegExp(
    '(?<=<style[\\s>][\\s\\S]*?\\s\\.[A-Za-z0-9_-]+-)(enter|leave)(?=[,{\\s][\\s\\S]*?</style>)',
    'g'
  )
  return content.replace(reg, '$1-from')
}
