!function (name, definition) {
  if (typeof define == 'function') define(definition)
  else if (typeof module != 'undefined') module.exports = definition()
  else this[name] = definition()
}('$script', function() {
  var win = this, doc = document
    , head = doc.getElementsByTagName('head')[0]
    , validBase = /^https?:\/\//
    , old = win.$script, list = {}, ids = {}, delay = {}, scriptpath
    , scripts = {'': 2}, s = 'string', f = false
    , push = 'push', domContentLoaded = 'DOMContentLoaded', readyState = 'readyState'
    , opera = 'opera', version = 'version', addEventListener = 'addEventListener'
    , onreadystatechange = (win[opera] && win[opera][version] && win[opera][version].call &&
        parseFloat(win[opera][version]()) < 10) ? 0 : 'onreadystatechange'

  function every(ar, fn, i, j) {
    for (i = 0, j = ar.length; i < j; ++i) if (!fn(ar[i])) return f
    return 1
  }
  function each(ar, fn) {
    every(ar, function(el) {
      return !fn(el)
    })
  }

  if (!doc[readyState] && doc[addEventListener]) {
    doc[addEventListener](domContentLoaded, function fn() {
      doc.removeEventListener(domContentLoaded, fn, f)
      doc[readyState] = 'complete'
    }, f)
    doc[readyState] = 'loading'
  }

  function $script(paths, idOrDone, optDone) {
    paths = paths[push] ? paths : [paths]
    var idOrDoneIsDone = idOrDone && idOrDone.call
      , done = idOrDoneIsDone ? idOrDone : optDone
      , id = idOrDoneIsDone ? paths.join('') : idOrDone
      , queue = paths.length
    function loopFn(item) {
      return item.call ? item() : list[item]
    }
    function callback() {
      if (!--queue) {
        if (done && done() === f) return;
        list[id] = 1
        for (var dset in delay) {
          every(dset.split('|'), loopFn) && !each(delay[dset], loopFn) && (delay[dset] = [])
        }
      }
    }
    setTimeout(function () {
      each(paths, function(path) {
        if (scripts[path]) {
          id && (ids[id] = 1)
          return scripts[path] == 2 && callback()
        }
        scripts[path] = 1
        id && (ids[id] = 1)
        create(!validBase.test(path) && scriptpath ? scriptpath + path + '.js' : path, callback)
      })
    }, 0)
    return $script
  }

  function create(path, fn) {
    var el = doc.createElement('script')
      , loaded = f
    el.onload = el.onerror = el[onreadystatechange] = function () {
      if ((el[readyState] && !(/^c|loade/.test(el[readyState]))) || loaded) return;
      el.onload = el.onerror = el[onreadystatechange] = null
      loaded = 1
      scripts[path] = 2
      fn()
    }
    el.async = 1
    el.src = path
    head.insertBefore(el, head.firstChild)
  }

  $script.get = create

  $script.order = function (scripts, id, done) {
    (function callback(s) {
      s = scripts.shift()
      if (!scripts.length) $script(s, id, done)
      else $script(s, callback)
    }())
  }

  $script.path = function(p) {
    scriptpath = p
  }
  $script.ready = function(deps, ready, req) {
    deps = deps[push] ? deps : [deps]
    var missing = [];
    !each(deps, function(dep) {
      list[dep] || missing[push](dep);
    }) && every(deps, function(dep) {return list[dep]}) ?
      ready() : !function(key) {
      delay[key] = delay[key] || []
      delay[key][push](ready)
      req && req(missing)
    }(deps.join('|'))
    return $script
  }

  $script.noConflict = function () {
    win.$script = old;
    return this
  }

  return $script
})