/******/ (function(modules) { // webpackBootstrap
/******/ 	function hotDisposeChunk(chunkId) {
/******/ 		delete installedChunks[chunkId];
/******/ 	}
/******/ 	var parentHotUpdateCallback = this["webpackHotUpdate"];
/******/ 	this["webpackHotUpdate"] = 
/******/ 	function webpackHotUpdateCallback(chunkId, moreModules) { // eslint-disable-line no-unused-vars
/******/ 		hotAddUpdateChunk(chunkId, moreModules);
/******/ 		if(parentHotUpdateCallback) parentHotUpdateCallback(chunkId, moreModules);
/******/ 	} ;
/******/ 	
/******/ 	function hotDownloadUpdateChunk(chunkId) { // eslint-disable-line no-unused-vars
/******/ 		var head = document.getElementsByTagName("head")[0];
/******/ 		var script = document.createElement("script");
/******/ 		script.type = "text/javascript";
/******/ 		script.charset = "utf-8";
/******/ 		script.src = __webpack_require__.p + "" + chunkId + "." + hotCurrentHash + ".hot-update.js";
/******/ 		head.appendChild(script);
/******/ 	}
/******/ 	
/******/ 	function hotDownloadManifest(requestTimeout) { // eslint-disable-line no-unused-vars
/******/ 		requestTimeout = requestTimeout || 10000;
/******/ 		return new Promise(function(resolve, reject) {
/******/ 			if(typeof XMLHttpRequest === "undefined")
/******/ 				return reject(new Error("No browser support"));
/******/ 			try {
/******/ 				var request = new XMLHttpRequest();
/******/ 				var requestPath = __webpack_require__.p + "" + hotCurrentHash + ".hot-update.json";
/******/ 				request.open("GET", requestPath, true);
/******/ 				request.timeout = requestTimeout;
/******/ 				request.send(null);
/******/ 			} catch(err) {
/******/ 				return reject(err);
/******/ 			}
/******/ 			request.onreadystatechange = function() {
/******/ 				if(request.readyState !== 4) return;
/******/ 				if(request.status === 0) {
/******/ 					// timeout
/******/ 					reject(new Error("Manifest request to " + requestPath + " timed out."));
/******/ 				} else if(request.status === 404) {
/******/ 					// no update available
/******/ 					resolve();
/******/ 				} else if(request.status !== 200 && request.status !== 304) {
/******/ 					// other failure
/******/ 					reject(new Error("Manifest request to " + requestPath + " failed."));
/******/ 				} else {
/******/ 					// success
/******/ 					try {
/******/ 						var update = JSON.parse(request.responseText);
/******/ 					} catch(e) {
/******/ 						reject(e);
/******/ 						return;
/******/ 					}
/******/ 					resolve(update);
/******/ 				}
/******/ 			};
/******/ 		});
/******/ 	}
/******/
/******/ 	
/******/ 	
/******/ 	var hotApplyOnUpdate = true;
/******/ 	var hotCurrentHash = "bff63a01602bff9e9b92"; // eslint-disable-line no-unused-vars
/******/ 	var hotRequestTimeout = 10000;
/******/ 	var hotCurrentModuleData = {};
/******/ 	var hotCurrentChildModule; // eslint-disable-line no-unused-vars
/******/ 	var hotCurrentParents = []; // eslint-disable-line no-unused-vars
/******/ 	var hotCurrentParentsTemp = []; // eslint-disable-line no-unused-vars
/******/ 	
/******/ 	function hotCreateRequire(moduleId) { // eslint-disable-line no-unused-vars
/******/ 		var me = installedModules[moduleId];
/******/ 		if(!me) return __webpack_require__;
/******/ 		var fn = function(request) {
/******/ 			if(me.hot.active) {
/******/ 				if(installedModules[request]) {
/******/ 					if(installedModules[request].parents.indexOf(moduleId) < 0)
/******/ 						installedModules[request].parents.push(moduleId);
/******/ 				} else {
/******/ 					hotCurrentParents = [moduleId];
/******/ 					hotCurrentChildModule = request;
/******/ 				}
/******/ 				if(me.children.indexOf(request) < 0)
/******/ 					me.children.push(request);
/******/ 			} else {
/******/ 				console.warn("[HMR] unexpected require(" + request + ") from disposed module " + moduleId);
/******/ 				hotCurrentParents = [];
/******/ 			}
/******/ 			return __webpack_require__(request);
/******/ 		};
/******/ 		var ObjectFactory = function ObjectFactory(name) {
/******/ 			return {
/******/ 				configurable: true,
/******/ 				enumerable: true,
/******/ 				get: function() {
/******/ 					return __webpack_require__[name];
/******/ 				},
/******/ 				set: function(value) {
/******/ 					__webpack_require__[name] = value;
/******/ 				}
/******/ 			};
/******/ 		};
/******/ 		for(var name in __webpack_require__) {
/******/ 			if(Object.prototype.hasOwnProperty.call(__webpack_require__, name) && name !== "e") {
/******/ 				Object.defineProperty(fn, name, ObjectFactory(name));
/******/ 			}
/******/ 		}
/******/ 		fn.e = function(chunkId) {
/******/ 			if(hotStatus === "ready")
/******/ 				hotSetStatus("prepare");
/******/ 			hotChunksLoading++;
/******/ 			return __webpack_require__.e(chunkId).then(finishChunkLoading, function(err) {
/******/ 				finishChunkLoading();
/******/ 				throw err;
/******/ 			});
/******/ 	
/******/ 			function finishChunkLoading() {
/******/ 				hotChunksLoading--;
/******/ 				if(hotStatus === "prepare") {
/******/ 					if(!hotWaitingFilesMap[chunkId]) {
/******/ 						hotEnsureUpdateChunk(chunkId);
/******/ 					}
/******/ 					if(hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 						hotUpdateDownloaded();
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		return fn;
/******/ 	}
/******/ 	
/******/ 	function hotCreateModule(moduleId) { // eslint-disable-line no-unused-vars
/******/ 		var hot = {
/******/ 			// private stuff
/******/ 			_acceptedDependencies: {},
/******/ 			_declinedDependencies: {},
/******/ 			_selfAccepted: false,
/******/ 			_selfDeclined: false,
/******/ 			_disposeHandlers: [],
/******/ 			_main: hotCurrentChildModule !== moduleId,
/******/ 	
/******/ 			// Module API
/******/ 			active: true,
/******/ 			accept: function(dep, callback) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfAccepted = true;
/******/ 				else if(typeof dep === "function")
/******/ 					hot._selfAccepted = dep;
/******/ 				else if(typeof dep === "object")
/******/ 					for(var i = 0; i < dep.length; i++)
/******/ 						hot._acceptedDependencies[dep[i]] = callback || function() {};
/******/ 				else
/******/ 					hot._acceptedDependencies[dep] = callback || function() {};
/******/ 			},
/******/ 			decline: function(dep) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfDeclined = true;
/******/ 				else if(typeof dep === "object")
/******/ 					for(var i = 0; i < dep.length; i++)
/******/ 						hot._declinedDependencies[dep[i]] = true;
/******/ 				else
/******/ 					hot._declinedDependencies[dep] = true;
/******/ 			},
/******/ 			dispose: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			addDisposeHandler: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			removeDisposeHandler: function(callback) {
/******/ 				var idx = hot._disposeHandlers.indexOf(callback);
/******/ 				if(idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			// Management API
/******/ 			check: hotCheck,
/******/ 			apply: hotApply,
/******/ 			status: function(l) {
/******/ 				if(!l) return hotStatus;
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			addStatusHandler: function(l) {
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			removeStatusHandler: function(l) {
/******/ 				var idx = hotStatusHandlers.indexOf(l);
/******/ 				if(idx >= 0) hotStatusHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			//inherit from previous dispose call
/******/ 			data: hotCurrentModuleData[moduleId]
/******/ 		};
/******/ 		hotCurrentChildModule = undefined;
/******/ 		return hot;
/******/ 	}
/******/ 	
/******/ 	var hotStatusHandlers = [];
/******/ 	var hotStatus = "idle";
/******/ 	
/******/ 	function hotSetStatus(newStatus) {
/******/ 		hotStatus = newStatus;
/******/ 		for(var i = 0; i < hotStatusHandlers.length; i++)
/******/ 			hotStatusHandlers[i].call(null, newStatus);
/******/ 	}
/******/ 	
/******/ 	// while downloading
/******/ 	var hotWaitingFiles = 0;
/******/ 	var hotChunksLoading = 0;
/******/ 	var hotWaitingFilesMap = {};
/******/ 	var hotRequestedFilesMap = {};
/******/ 	var hotAvailableFilesMap = {};
/******/ 	var hotDeferred;
/******/ 	
/******/ 	// The update info
/******/ 	var hotUpdate, hotUpdateNewHash;
/******/ 	
/******/ 	function toModuleId(id) {
/******/ 		var isNumber = (+id) + "" === id;
/******/ 		return isNumber ? +id : id;
/******/ 	}
/******/ 	
/******/ 	function hotCheck(apply) {
/******/ 		if(hotStatus !== "idle") throw new Error("check() is only allowed in idle status");
/******/ 		hotApplyOnUpdate = apply;
/******/ 		hotSetStatus("check");
/******/ 		return hotDownloadManifest(hotRequestTimeout).then(function(update) {
/******/ 			if(!update) {
/******/ 				hotSetStatus("idle");
/******/ 				return null;
/******/ 			}
/******/ 			hotRequestedFilesMap = {};
/******/ 			hotWaitingFilesMap = {};
/******/ 			hotAvailableFilesMap = update.c;
/******/ 			hotUpdateNewHash = update.h;
/******/ 	
/******/ 			hotSetStatus("prepare");
/******/ 			var promise = new Promise(function(resolve, reject) {
/******/ 				hotDeferred = {
/******/ 					resolve: resolve,
/******/ 					reject: reject
/******/ 				};
/******/ 			});
/******/ 			hotUpdate = {};
/******/ 			var chunkId = 0;
/******/ 			{ // eslint-disable-line no-lone-blocks
/******/ 				/*globals chunkId */
/******/ 				hotEnsureUpdateChunk(chunkId);
/******/ 			}
/******/ 			if(hotStatus === "prepare" && hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 				hotUpdateDownloaded();
/******/ 			}
/******/ 			return promise;
/******/ 		});
/******/ 	}
/******/ 	
/******/ 	function hotAddUpdateChunk(chunkId, moreModules) { // eslint-disable-line no-unused-vars
/******/ 		if(!hotAvailableFilesMap[chunkId] || !hotRequestedFilesMap[chunkId])
/******/ 			return;
/******/ 		hotRequestedFilesMap[chunkId] = false;
/******/ 		for(var moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				hotUpdate[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(--hotWaitingFiles === 0 && hotChunksLoading === 0) {
/******/ 			hotUpdateDownloaded();
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotEnsureUpdateChunk(chunkId) {
/******/ 		if(!hotAvailableFilesMap[chunkId]) {
/******/ 			hotWaitingFilesMap[chunkId] = true;
/******/ 		} else {
/******/ 			hotRequestedFilesMap[chunkId] = true;
/******/ 			hotWaitingFiles++;
/******/ 			hotDownloadUpdateChunk(chunkId);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotUpdateDownloaded() {
/******/ 		hotSetStatus("ready");
/******/ 		var deferred = hotDeferred;
/******/ 		hotDeferred = null;
/******/ 		if(!deferred) return;
/******/ 		if(hotApplyOnUpdate) {
/******/ 			// Wrap deferred object in Promise to mark it as a well-handled Promise to
/******/ 			// avoid triggering uncaught exception warning in Chrome.
/******/ 			// See https://bugs.chromium.org/p/chromium/issues/detail?id=465666
/******/ 			Promise.resolve().then(function() {
/******/ 				return hotApply(hotApplyOnUpdate);
/******/ 			}).then(
/******/ 				function(result) {
/******/ 					deferred.resolve(result);
/******/ 				},
/******/ 				function(err) {
/******/ 					deferred.reject(err);
/******/ 				}
/******/ 			);
/******/ 		} else {
/******/ 			var outdatedModules = [];
/******/ 			for(var id in hotUpdate) {
/******/ 				if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 					outdatedModules.push(toModuleId(id));
/******/ 				}
/******/ 			}
/******/ 			deferred.resolve(outdatedModules);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotApply(options) {
/******/ 		if(hotStatus !== "ready") throw new Error("apply() is only allowed in ready status");
/******/ 		options = options || {};
/******/ 	
/******/ 		var cb;
/******/ 		var i;
/******/ 		var j;
/******/ 		var module;
/******/ 		var moduleId;
/******/ 	
/******/ 		function getAffectedStuff(updateModuleId) {
/******/ 			var outdatedModules = [updateModuleId];
/******/ 			var outdatedDependencies = {};
/******/ 	
/******/ 			var queue = outdatedModules.slice().map(function(id) {
/******/ 				return {
/******/ 					chain: [id],
/******/ 					id: id
/******/ 				};
/******/ 			});
/******/ 			while(queue.length > 0) {
/******/ 				var queueItem = queue.pop();
/******/ 				var moduleId = queueItem.id;
/******/ 				var chain = queueItem.chain;
/******/ 				module = installedModules[moduleId];
/******/ 				if(!module || module.hot._selfAccepted)
/******/ 					continue;
/******/ 				if(module.hot._selfDeclined) {
/******/ 					return {
/******/ 						type: "self-declined",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				if(module.hot._main) {
/******/ 					return {
/******/ 						type: "unaccepted",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				for(var i = 0; i < module.parents.length; i++) {
/******/ 					var parentId = module.parents[i];
/******/ 					var parent = installedModules[parentId];
/******/ 					if(!parent) continue;
/******/ 					if(parent.hot._declinedDependencies[moduleId]) {
/******/ 						return {
/******/ 							type: "declined",
/******/ 							chain: chain.concat([parentId]),
/******/ 							moduleId: moduleId,
/******/ 							parentId: parentId
/******/ 						};
/******/ 					}
/******/ 					if(outdatedModules.indexOf(parentId) >= 0) continue;
/******/ 					if(parent.hot._acceptedDependencies[moduleId]) {
/******/ 						if(!outdatedDependencies[parentId])
/******/ 							outdatedDependencies[parentId] = [];
/******/ 						addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 						continue;
/******/ 					}
/******/ 					delete outdatedDependencies[parentId];
/******/ 					outdatedModules.push(parentId);
/******/ 					queue.push({
/******/ 						chain: chain.concat([parentId]),
/******/ 						id: parentId
/******/ 					});
/******/ 				}
/******/ 			}
/******/ 	
/******/ 			return {
/******/ 				type: "accepted",
/******/ 				moduleId: updateModuleId,
/******/ 				outdatedModules: outdatedModules,
/******/ 				outdatedDependencies: outdatedDependencies
/******/ 			};
/******/ 		}
/******/ 	
/******/ 		function addAllToSet(a, b) {
/******/ 			for(var i = 0; i < b.length; i++) {
/******/ 				var item = b[i];
/******/ 				if(a.indexOf(item) < 0)
/******/ 					a.push(item);
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// at begin all updates modules are outdated
/******/ 		// the "outdated" status can propagate to parents if they don't accept the children
/******/ 		var outdatedDependencies = {};
/******/ 		var outdatedModules = [];
/******/ 		var appliedUpdate = {};
/******/ 	
/******/ 		var warnUnexpectedRequire = function warnUnexpectedRequire() {
/******/ 			console.warn("[HMR] unexpected require(" + result.moduleId + ") to disposed module");
/******/ 		};
/******/ 	
/******/ 		for(var id in hotUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 				moduleId = toModuleId(id);
/******/ 				var result;
/******/ 				if(hotUpdate[id]) {
/******/ 					result = getAffectedStuff(moduleId);
/******/ 				} else {
/******/ 					result = {
/******/ 						type: "disposed",
/******/ 						moduleId: id
/******/ 					};
/******/ 				}
/******/ 				var abortError = false;
/******/ 				var doApply = false;
/******/ 				var doDispose = false;
/******/ 				var chainInfo = "";
/******/ 				if(result.chain) {
/******/ 					chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
/******/ 				}
/******/ 				switch(result.type) {
/******/ 					case "self-declined":
/******/ 						if(options.onDeclined)
/******/ 							options.onDeclined(result);
/******/ 						if(!options.ignoreDeclined)
/******/ 							abortError = new Error("Aborted because of self decline: " + result.moduleId + chainInfo);
/******/ 						break;
/******/ 					case "declined":
/******/ 						if(options.onDeclined)
/******/ 							options.onDeclined(result);
/******/ 						if(!options.ignoreDeclined)
/******/ 							abortError = new Error("Aborted because of declined dependency: " + result.moduleId + " in " + result.parentId + chainInfo);
/******/ 						break;
/******/ 					case "unaccepted":
/******/ 						if(options.onUnaccepted)
/******/ 							options.onUnaccepted(result);
/******/ 						if(!options.ignoreUnaccepted)
/******/ 							abortError = new Error("Aborted because " + moduleId + " is not accepted" + chainInfo);
/******/ 						break;
/******/ 					case "accepted":
/******/ 						if(options.onAccepted)
/******/ 							options.onAccepted(result);
/******/ 						doApply = true;
/******/ 						break;
/******/ 					case "disposed":
/******/ 						if(options.onDisposed)
/******/ 							options.onDisposed(result);
/******/ 						doDispose = true;
/******/ 						break;
/******/ 					default:
/******/ 						throw new Error("Unexception type " + result.type);
/******/ 				}
/******/ 				if(abortError) {
/******/ 					hotSetStatus("abort");
/******/ 					return Promise.reject(abortError);
/******/ 				}
/******/ 				if(doApply) {
/******/ 					appliedUpdate[moduleId] = hotUpdate[moduleId];
/******/ 					addAllToSet(outdatedModules, result.outdatedModules);
/******/ 					for(moduleId in result.outdatedDependencies) {
/******/ 						if(Object.prototype.hasOwnProperty.call(result.outdatedDependencies, moduleId)) {
/******/ 							if(!outdatedDependencies[moduleId])
/******/ 								outdatedDependencies[moduleId] = [];
/******/ 							addAllToSet(outdatedDependencies[moduleId], result.outdatedDependencies[moduleId]);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 				if(doDispose) {
/******/ 					addAllToSet(outdatedModules, [result.moduleId]);
/******/ 					appliedUpdate[moduleId] = warnUnexpectedRequire;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Store self accepted outdated modules to require them later by the module system
/******/ 		var outdatedSelfAcceptedModules = [];
/******/ 		for(i = 0; i < outdatedModules.length; i++) {
/******/ 			moduleId = outdatedModules[i];
/******/ 			if(installedModules[moduleId] && installedModules[moduleId].hot._selfAccepted)
/******/ 				outdatedSelfAcceptedModules.push({
/******/ 					module: moduleId,
/******/ 					errorHandler: installedModules[moduleId].hot._selfAccepted
/******/ 				});
/******/ 		}
/******/ 	
/******/ 		// Now in "dispose" phase
/******/ 		hotSetStatus("dispose");
/******/ 		Object.keys(hotAvailableFilesMap).forEach(function(chunkId) {
/******/ 			if(hotAvailableFilesMap[chunkId] === false) {
/******/ 				hotDisposeChunk(chunkId);
/******/ 			}
/******/ 		});
/******/ 	
/******/ 		var idx;
/******/ 		var queue = outdatedModules.slice();
/******/ 		while(queue.length > 0) {
/******/ 			moduleId = queue.pop();
/******/ 			module = installedModules[moduleId];
/******/ 			if(!module) continue;
/******/ 	
/******/ 			var data = {};
/******/ 	
/******/ 			// Call dispose handlers
/******/ 			var disposeHandlers = module.hot._disposeHandlers;
/******/ 			for(j = 0; j < disposeHandlers.length; j++) {
/******/ 				cb = disposeHandlers[j];
/******/ 				cb(data);
/******/ 			}
/******/ 			hotCurrentModuleData[moduleId] = data;
/******/ 	
/******/ 			// disable module (this disables requires from this module)
/******/ 			module.hot.active = false;
/******/ 	
/******/ 			// remove module from cache
/******/ 			delete installedModules[moduleId];
/******/ 	
/******/ 			// when disposing there is no need to call dispose handler
/******/ 			delete outdatedDependencies[moduleId];
/******/ 	
/******/ 			// remove "parents" references from all children
/******/ 			for(j = 0; j < module.children.length; j++) {
/******/ 				var child = installedModules[module.children[j]];
/******/ 				if(!child) continue;
/******/ 				idx = child.parents.indexOf(moduleId);
/******/ 				if(idx >= 0) {
/******/ 					child.parents.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// remove outdated dependency from module children
/******/ 		var dependency;
/******/ 		var moduleOutdatedDependencies;
/******/ 		for(moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				module = installedModules[moduleId];
/******/ 				if(module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					for(j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 						dependency = moduleOutdatedDependencies[j];
/******/ 						idx = module.children.indexOf(dependency);
/******/ 						if(idx >= 0) module.children.splice(idx, 1);
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Not in "apply" phase
/******/ 		hotSetStatus("apply");
/******/ 	
/******/ 		hotCurrentHash = hotUpdateNewHash;
/******/ 	
/******/ 		// insert new code
/******/ 		for(moduleId in appliedUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(appliedUpdate, moduleId)) {
/******/ 				modules[moduleId] = appliedUpdate[moduleId];
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// call accept handlers
/******/ 		var error = null;
/******/ 		for(moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				module = installedModules[moduleId];
/******/ 				if(module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					var callbacks = [];
/******/ 					for(i = 0; i < moduleOutdatedDependencies.length; i++) {
/******/ 						dependency = moduleOutdatedDependencies[i];
/******/ 						cb = module.hot._acceptedDependencies[dependency];
/******/ 						if(cb) {
/******/ 							if(callbacks.indexOf(cb) >= 0) continue;
/******/ 							callbacks.push(cb);
/******/ 						}
/******/ 					}
/******/ 					for(i = 0; i < callbacks.length; i++) {
/******/ 						cb = callbacks[i];
/******/ 						try {
/******/ 							cb(moduleOutdatedDependencies);
/******/ 						} catch(err) {
/******/ 							if(options.onErrored) {
/******/ 								options.onErrored({
/******/ 									type: "accept-errored",
/******/ 									moduleId: moduleId,
/******/ 									dependencyId: moduleOutdatedDependencies[i],
/******/ 									error: err
/******/ 								});
/******/ 							}
/******/ 							if(!options.ignoreErrored) {
/******/ 								if(!error)
/******/ 									error = err;
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Load self accepted modules
/******/ 		for(i = 0; i < outdatedSelfAcceptedModules.length; i++) {
/******/ 			var item = outdatedSelfAcceptedModules[i];
/******/ 			moduleId = item.module;
/******/ 			hotCurrentParents = [moduleId];
/******/ 			try {
/******/ 				__webpack_require__(moduleId);
/******/ 			} catch(err) {
/******/ 				if(typeof item.errorHandler === "function") {
/******/ 					try {
/******/ 						item.errorHandler(err);
/******/ 					} catch(err2) {
/******/ 						if(options.onErrored) {
/******/ 							options.onErrored({
/******/ 								type: "self-accept-error-handler-errored",
/******/ 								moduleId: moduleId,
/******/ 								error: err2,
/******/ 								orginalError: err, // TODO remove in webpack 4
/******/ 								originalError: err
/******/ 							});
/******/ 						}
/******/ 						if(!options.ignoreErrored) {
/******/ 							if(!error)
/******/ 								error = err2;
/******/ 						}
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				} else {
/******/ 					if(options.onErrored) {
/******/ 						options.onErrored({
/******/ 							type: "self-accept-errored",
/******/ 							moduleId: moduleId,
/******/ 							error: err
/******/ 						});
/******/ 					}
/******/ 					if(!options.ignoreErrored) {
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// handle errors in accept handlers and self accepted module load
/******/ 		if(error) {
/******/ 			hotSetStatus("fail");
/******/ 			return Promise.reject(error);
/******/ 		}
/******/ 	
/******/ 		hotSetStatus("idle");
/******/ 		return new Promise(function(resolve) {
/******/ 			resolve(outdatedModules);
/******/ 		});
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {},
/******/ 			hot: hotCreateModule(moduleId),
/******/ 			parents: (hotCurrentParentsTemp = hotCurrentParents, hotCurrentParents = [], hotCurrentParentsTemp),
/******/ 			children: []
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// __webpack_hash__
/******/ 	__webpack_require__.h = function() { return hotCurrentHash; };
/******/
/******/ 	// Load entry module and return exports
/******/ 	return hotCreateRequire("./src/index.js")(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../../node_modules/kwak/lib/index.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash_isequal__ = __webpack_require__("../../node_modules/lodash.isequal/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash_isequal___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_lodash_isequal__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_lodash_isplainobject__ = __webpack_require__("../../node_modules/lodash.isplainobject/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_lodash_isplainobject___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_lodash_isplainobject__);





const assert = (condition, message) => {

  if (condition) return condition;

  throw new Error(message);
};
/* harmony export (immutable) */ __webpack_exports__["a"] = assert;


const isDeeplyEqual = __WEBPACK_IMPORTED_MODULE_0_lodash_isequal___default.a;
/* harmony export (immutable) */ __webpack_exports__["c"] = isDeeplyEqual;

const isEqualTo = (value, input) => input === value;
/* harmony export (immutable) */ __webpack_exports__["f"] = isEqualTo;

const isTrue = input => isEqualTo(true, input);
/* unused harmony export isTrue */

const isUndefined = input => isEqualTo(void 0, input);
/* harmony export (immutable) */ __webpack_exports__["l"] = isUndefined;

const isNull = input => isEqualTo(null, input);
/* harmony export (immutable) */ __webpack_exports__["h"] = isNull;

const isInstanceOf = (type, input) => input instanceof type;
/* unused harmony export isInstanceOf */

const isArray = input => isInstanceOf(Array, input);
/* harmony export (immutable) */ __webpack_exports__["b"] = isArray;

const isOfType = (type, input) => isEqualTo(type, typeof input);
/* unused harmony export isOfType */

const isObject = input => isOfType('object', input);
/* harmony export (immutable) */ __webpack_exports__["i"] = isObject;

const isPlainObject = __WEBPACK_IMPORTED_MODULE_1_lodash_isplainobject___default.a;
/* harmony export (immutable) */ __webpack_exports__["j"] = isPlainObject;

const isEmpty = input => input.length < 1;
/* harmony export (immutable) */ __webpack_exports__["e"] = isEmpty;

const isBoolean = input => isOfType('boolean', input);
/* unused harmony export isBoolean */

const isString = input => {

  return isOfType('string', input);
};
/* harmony export (immutable) */ __webpack_exports__["k"] = isString;

const isFunction = input => isOfType('function', input) && input;
/* harmony export (immutable) */ __webpack_exports__["g"] = isFunction;

const isNumber = input => isOfType('number', input);
/* unused harmony export isNumber */

const isInteger = input => Number.isInteger(input);
/* unused harmony export isInteger */

const isComponent = input => isObject(input) && input.isPwetComponent === true;
/* unused harmony export isComponent */

const isElement = input => isInstanceOf(HTMLElement, input) && input.nodeType === 1;
/* harmony export (immutable) */ __webpack_exports__["d"] = isElement;

const isUnknownElement = input => Object.prototype.toString.call(input) === '[object HTMLUnknownElement]';
/* unused harmony export isUnknownElement */


/***/ }),

/***/ "../../node_modules/lodash.clonedeep/index.js":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, module) {/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/**
 * Adds the key-value `pair` to `map`.
 *
 * @private
 * @param {Object} map The map to modify.
 * @param {Array} pair The key-value pair to add.
 * @returns {Object} Returns `map`.
 */
function addMapEntry(map, pair) {
  // Don't return `map.set` because it's not chainable in IE 11.
  map.set(pair[0], pair[1]);
  return map;
}

/**
 * Adds `value` to `set`.
 *
 * @private
 * @param {Object} set The set to modify.
 * @param {*} value The value to add.
 * @returns {Object} Returns `set`.
 */
function addSetEntry(set, value) {
  // Don't return `set.add` because it's not chainable in IE 11.
  set.add(value);
  return set;
}

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/**
 * A specialized version of `_.reduce` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @param {boolean} [initAccum] Specify using the first element of `array` as
 *  the initial value.
 * @returns {*} Returns the accumulated value.
 */
function arrayReduce(array, iteratee, accumulator, initAccum) {
  var index = -1,
      length = array ? array.length : 0;

  if (initAccum && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }
  return accumulator;
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function (value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function (arg) {
    return func(transform(arg));
  };
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function (value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = function () {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? 'Symbol(src)_1.' + uid : '';
}();

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' + funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    getPrototype = overArg(Object.getPrototypeOf, Object),
    objectCreate = Object.create,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols,
    nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
    nativeKeys = overArg(Object.keys, Object);

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView'),
    Map = getNative(root, 'Map'),
    Promise = getNative(root, 'Promise'),
    Set = getNative(root, 'Set'),
    WeakMap = getNative(root, 'WeakMap'),
    nativeCreate = getNative(Object, 'create');

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash(),
    'map': new (Map || ListCache)(),
    'string': new Hash()
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  this.__data__ = new ListCache(entries);
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache();
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  return this.__data__['delete'](key);
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var cache = this.__data__;
  if (cache instanceof ListCache) {
    var pairs = cache.__data__;
    if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
      pairs.push([key, value]);
      return this;
    }
    cache = this.__data__ = new MapCache(pairs);
  }
  cache.set(key, value);
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = isArray(value) || isArguments(value) ? baseTimes(value.length, String) : [];

  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === undefined && !(key in object)) {
    object[key] = value;
  }
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && copyObject(source, keys(source), object);
}

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @param {boolean} [isFull] Specify a clone including symbols.
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, isDeep, isFull, customizer, key, object, stack) {
  var result;
  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject(value)) {
    return value;
  }
  var isArr = isArray(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return copyArray(value, result);
    }
  } else {
    var tag = getTag(value),
        isFunc = tag == funcTag || tag == genTag;

    if (isBuffer(value)) {
      return cloneBuffer(value, isDeep);
    }
    if (tag == objectTag || tag == argsTag || isFunc && !object) {
      if (isHostObject(value)) {
        return object ? value : {};
      }
      result = initCloneObject(isFunc ? {} : value);
      if (!isDeep) {
        return copySymbols(value, baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag(value, tag, baseClone, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new Stack());
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  if (!isArr) {
    var props = isFull ? getAllKeys(value) : keys(value);
  }
  arrayEach(props || value, function (subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    assignValue(result, key, baseClone(subValue, isDeep, isFull, customizer, key, value, stack));
  });
  return result;
}

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} prototype The object to inherit from.
 * @returns {Object} Returns the new object.
 */
function baseCreate(proto) {
  return isObject(proto) ? objectCreate(proto) : {};
}

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

/**
 * The base implementation of `getTag`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  return objectToString.call(value);
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) || isHostObject(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var result = new buffer.constructor(buffer.length);
  buffer.copy(result);
  return result;
}

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

/**
 * Creates a clone of `map`.
 *
 * @private
 * @param {Object} map The map to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned map.
 */
function cloneMap(map, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(mapToArray(map), true) : mapToArray(map);
  return arrayReduce(array, addMapEntry, new map.constructor());
}

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

/**
 * Creates a clone of `set`.
 *
 * @private
 * @param {Object} set The set to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned set.
 */
function cloneSet(set, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(setToArray(set), true) : setToArray(set);
  return arrayReduce(array, addSetEntry, new set.constructor());
}

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined;

    assignValue(object, key, newValue === undefined ? source[key] : newValue);
  }
  return object;
}

/**
 * Copies own symbol properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return copyObject(source, getSymbols(source), object);
}

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * Creates an array of the own enumerable symbol properties of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = nativeGetSymbols ? overArg(nativeGetSymbols, Object) : stubArray;

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11,
// for data views in Edge < 14, and promises in Node.js.
if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map && getTag(new Map()) != mapTag || Promise && getTag(Promise.resolve()) != promiseTag || Set && getTag(new Set()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) {
  getTag = function (value) {
    var result = objectToString.call(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : undefined;

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString:
          return dataViewTag;
        case mapCtorString:
          return mapTag;
        case promiseCtorString:
          return promiseTag;
        case setCtorString:
          return setTag;
        case weakMapCtorString:
          return weakMapTag;
      }
    }
    return result;
  };
}

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return typeof object.constructor == 'function' && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
}

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, cloneFunc, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag:
      return cloneArrayBuffer(object);

    case boolTag:
    case dateTag:
      return new Ctor(+object);

    case dataViewTag:
      return cloneDataView(object, isDeep);

    case float32Tag:case float64Tag:
    case int8Tag:case int16Tag:case int32Tag:
    case uint8Tag:case uint8ClampedTag:case uint16Tag:case uint32Tag:
      return cloneTypedArray(object, isDeep);

    case mapTag:
      return cloneMap(object, isDeep, cloneFunc);

    case numberTag:
    case stringTag:
      return new Ctor(object);

    case regexpTag:
      return cloneRegExp(object);

    case setTag:
      return cloneSet(object, isDeep, cloneFunc);

    case symbolTag:
      return cloneSymbol(object);
  }
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length && (typeof value == 'number' || reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && maskSrcKey in func;
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = typeof Ctor == 'function' && Ctor.prototype || objectProto;

  return value === proto;
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return func + '';
    } catch (e) {}
  }
  return '';
}

/**
 * This method is like `_.clone` except that it recursively clones `value`.
 *
 * @static
 * @memberOf _
 * @since 1.0.0
 * @category Lang
 * @param {*} value The value to recursively clone.
 * @returns {*} Returns the deep cloned value.
 * @see _.clone
 * @example
 *
 * var objects = [{ 'a': 1 }, { 'b': 2 }];
 *
 * var deep = _.cloneDeep(objects);
 * console.log(deep[0] === objects[0]);
 * // => false
 */
function cloneDeep(value) {
  return baseClone(value, true, true);
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || value !== value && other !== other;
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') && (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = cloneDeep;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__("./node_modules/webpack/buildin/global.js"), __webpack_require__("./node_modules/webpack/buildin/module.js")(module)))

/***/ }),

/***/ "../../node_modules/lodash.isequal/index.js":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, module) {/**
 * Lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright JS Foundation and other contributors <https://js.foundation/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    asyncTag = '[object AsyncFunction]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    nullTag = '[object Null]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    proxyTag = '[object Proxy]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    undefinedTag = '[object Undefined]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = function () {
  try {
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}();

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function (value) {
    return func(value);
  };
}

/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function (value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function (arg) {
    return func(transform(arg));
  };
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function (value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect methods masquerading as native. */
var maskSrcKey = function () {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? 'Symbol(src)_1.' + uid : '';
}();

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' + funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice,
    symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols,
    nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
    nativeKeys = overArg(Object.keys, Object);

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView'),
    Map = getNative(root, 'Map'),
    Promise = getNative(root, 'Promise'),
    Set = getNative(root, 'Set'),
    WeakMap = getNative(root, 'WeakMap'),
    nativeCreate = getNative(Object, 'create');

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash(),
    'map': new (Map || ListCache)(),
    'string': new Hash()
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;

  this.__data__ = new MapCache();
  while (++index < length) {
    this.add(values[index]);
  }
}

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache();
  this.size = 0;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (
    // Safari 9 has enumerable `arguments.length` in strict mode.
    key == 'length' ||
    // Node.js 0.10 has enumerable non-index properties on buffers.
    isBuff && (key == 'offset' || key == 'parent') ||
    // PhantomJS 2 has enumerable non-index properties on typed arrays.
    isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset') ||
    // Skip index properties.
    isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Unordered comparison
 *  2 - Partial comparison
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = objIsArr ? arrayTag : getTag(object),
      othTag = othIsArr ? arrayTag : getTag(other);

  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;

  var objIsObj = objTag == objectTag,
      othIsObj = othTag == objectTag,
      isSameTag = objTag == othTag;

  if (isSameTag && isBuffer(object)) {
    if (!isBuffer(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack());
    return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new Stack());
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack());
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(array);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var index = -1,
      result = true,
      seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!arraySome(other, function (othValue, othIndex) {
        if (!cacheHas(seen, othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
          return seen.push(othIndex);
        }
      })) {
        result = false;
        break;
      }
    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag:
      if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }
      return true;

    case boolTag:
    case dateTag:
    case numberTag:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq(+object, +other);

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == other + '';

    case mapTag:
      var convert = mapToArray;

    case setTag:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
      convert || (convert = setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG;

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack['delete'](object);
      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      objProps = getAllKeys(object),
      objLength = objProps.length,
      othProps = getAllKeys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
      return false;
    }
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(object);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor && 'constructor' in object && 'constructor' in other && !(typeof objCtor == 'function' && objCtor instanceof objCtor && typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols ? stubArray : function (object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function (symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map && getTag(new Map()) != mapTag || Promise && getTag(Promise.resolve()) != promiseTag || Set && getTag(new Set()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) {
  getTag = function (value) {
    var result = baseGetTag(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString:
          return dataViewTag;
        case mapCtorString:
          return mapTag;
        case promiseCtorString:
          return promiseTag;
        case setCtorString:
          return setTag;
        case weakMapCtorString:
          return weakMapTag;
      }
    }
    return result;
  };
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length && (typeof value == 'number' || reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && maskSrcKey in func;
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = typeof Ctor == 'function' && Ctor.prototype || objectProto;

  return value === proto;
}

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return func + '';
    } catch (e) {}
  }
  return '';
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || value !== value && other !== other;
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function () {
  return arguments;
}()) ? baseIsArguments : function (value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
};

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

/**
 * Performs a deep comparison between two values to determine if they are
 * equivalent.
 *
 * **Note:** This method supports comparing arrays, array buffers, booleans,
 * date objects, error objects, maps, numbers, `Object` objects, regexes,
 * sets, strings, symbols, and typed arrays. `Object` objects are compared
 * by their own, not inherited, enumerable properties. Functions and DOM
 * nodes are compared by strict equality, i.e. `===`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.isEqual(object, other);
 * // => true
 *
 * object === other;
 * // => false
 */
function isEqual(value, other) {
  return baseIsEqual(value, other);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = isEqual;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__("./node_modules/webpack/buildin/global.js"), __webpack_require__("./node_modules/webpack/buildin/module.js")(module)))

/***/ }),

/***/ "../../node_modules/lodash.isplainobject/index.js":
/***/ (function(module, exports) {

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function (arg) {
    return func(transform(arg));
  };
}

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) || objectToString.call(value) != objectTag || isHostObject(value)) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
}

module.exports = isPlainObject;

/***/ }),

/***/ "../../node_modules/lodash.kebabcase/index.js":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match words composed of alphanumeric characters. */
var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;

/** Used to match Latin Unicode letters (excluding mathematical operators). */
var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;

/** Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff',
    rsComboMarksRange = '\\u0300-\\u036f\\ufe20-\\ufe23',
    rsComboSymbolsRange = '\\u20d0-\\u20f0',
    rsDingbatRange = '\\u2700-\\u27bf',
    rsLowerRange = 'a-z\\xdf-\\xf6\\xf8-\\xff',
    rsMathOpRange = '\\xac\\xb1\\xd7\\xf7',
    rsNonCharRange = '\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf',
    rsPunctuationRange = '\\u2000-\\u206f',
    rsSpaceRange = ' \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000',
    rsUpperRange = 'A-Z\\xc0-\\xd6\\xd8-\\xde',
    rsVarRange = '\\ufe0e\\ufe0f',
    rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;

/** Used to compose unicode capture groups. */
var rsApos = "['\u2019]",
    rsBreak = '[' + rsBreakRange + ']',
    rsCombo = '[' + rsComboMarksRange + rsComboSymbolsRange + ']',
    rsDigits = '\\d+',
    rsDingbat = '[' + rsDingbatRange + ']',
    rsLower = '[' + rsLowerRange + ']',
    rsMisc = '[^' + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + ']',
    rsFitz = '\\ud83c[\\udffb-\\udfff]',
    rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
    rsNonAstral = '[^' + rsAstralRange + ']',
    rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
    rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
    rsUpper = '[' + rsUpperRange + ']',
    rsZWJ = '\\u200d';

/** Used to compose unicode regexes. */
var rsLowerMisc = '(?:' + rsLower + '|' + rsMisc + ')',
    rsUpperMisc = '(?:' + rsUpper + '|' + rsMisc + ')',
    rsOptLowerContr = '(?:' + rsApos + '(?:d|ll|m|re|s|t|ve))?',
    rsOptUpperContr = '(?:' + rsApos + '(?:D|LL|M|RE|S|T|VE))?',
    reOptMod = rsModifier + '?',
    rsOptVar = '[' + rsVarRange + ']?',
    rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
    rsSeq = rsOptVar + reOptMod + rsOptJoin,
    rsEmoji = '(?:' + [rsDingbat, rsRegional, rsSurrPair].join('|') + ')' + rsSeq;

/** Used to match apostrophes. */
var reApos = RegExp(rsApos, 'g');

/**
 * Used to match [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks) and
 * [combining diacritical marks for symbols](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks_for_Symbols).
 */
var reComboMark = RegExp(rsCombo, 'g');

/** Used to match complex or compound words. */
var reUnicodeWord = RegExp([rsUpper + '?' + rsLower + '+' + rsOptLowerContr + '(?=' + [rsBreak, rsUpper, '$'].join('|') + ')', rsUpperMisc + '+' + rsOptUpperContr + '(?=' + [rsBreak, rsUpper + rsLowerMisc, '$'].join('|') + ')', rsUpper + '?' + rsLowerMisc + '+' + rsOptLowerContr, rsUpper + '+' + rsOptUpperContr, rsDigits, rsEmoji].join('|'), 'g');

/** Used to detect strings that need a more robust regexp to match words. */
var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2,}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;

/** Used to map Latin Unicode letters to basic Latin letters. */
var deburredLetters = {
  // Latin-1 Supplement block.
  '\xc0': 'A', '\xc1': 'A', '\xc2': 'A', '\xc3': 'A', '\xc4': 'A', '\xc5': 'A',
  '\xe0': 'a', '\xe1': 'a', '\xe2': 'a', '\xe3': 'a', '\xe4': 'a', '\xe5': 'a',
  '\xc7': 'C', '\xe7': 'c',
  '\xd0': 'D', '\xf0': 'd',
  '\xc8': 'E', '\xc9': 'E', '\xca': 'E', '\xcb': 'E',
  '\xe8': 'e', '\xe9': 'e', '\xea': 'e', '\xeb': 'e',
  '\xcc': 'I', '\xcd': 'I', '\xce': 'I', '\xcf': 'I',
  '\xec': 'i', '\xed': 'i', '\xee': 'i', '\xef': 'i',
  '\xd1': 'N', '\xf1': 'n',
  '\xd2': 'O', '\xd3': 'O', '\xd4': 'O', '\xd5': 'O', '\xd6': 'O', '\xd8': 'O',
  '\xf2': 'o', '\xf3': 'o', '\xf4': 'o', '\xf5': 'o', '\xf6': 'o', '\xf8': 'o',
  '\xd9': 'U', '\xda': 'U', '\xdb': 'U', '\xdc': 'U',
  '\xf9': 'u', '\xfa': 'u', '\xfb': 'u', '\xfc': 'u',
  '\xdd': 'Y', '\xfd': 'y', '\xff': 'y',
  '\xc6': 'Ae', '\xe6': 'ae',
  '\xde': 'Th', '\xfe': 'th',
  '\xdf': 'ss',
  // Latin Extended-A block.
  '\u0100': 'A', '\u0102': 'A', '\u0104': 'A',
  '\u0101': 'a', '\u0103': 'a', '\u0105': 'a',
  '\u0106': 'C', '\u0108': 'C', '\u010a': 'C', '\u010c': 'C',
  '\u0107': 'c', '\u0109': 'c', '\u010b': 'c', '\u010d': 'c',
  '\u010e': 'D', '\u0110': 'D', '\u010f': 'd', '\u0111': 'd',
  '\u0112': 'E', '\u0114': 'E', '\u0116': 'E', '\u0118': 'E', '\u011a': 'E',
  '\u0113': 'e', '\u0115': 'e', '\u0117': 'e', '\u0119': 'e', '\u011b': 'e',
  '\u011c': 'G', '\u011e': 'G', '\u0120': 'G', '\u0122': 'G',
  '\u011d': 'g', '\u011f': 'g', '\u0121': 'g', '\u0123': 'g',
  '\u0124': 'H', '\u0126': 'H', '\u0125': 'h', '\u0127': 'h',
  '\u0128': 'I', '\u012a': 'I', '\u012c': 'I', '\u012e': 'I', '\u0130': 'I',
  '\u0129': 'i', '\u012b': 'i', '\u012d': 'i', '\u012f': 'i', '\u0131': 'i',
  '\u0134': 'J', '\u0135': 'j',
  '\u0136': 'K', '\u0137': 'k', '\u0138': 'k',
  '\u0139': 'L', '\u013b': 'L', '\u013d': 'L', '\u013f': 'L', '\u0141': 'L',
  '\u013a': 'l', '\u013c': 'l', '\u013e': 'l', '\u0140': 'l', '\u0142': 'l',
  '\u0143': 'N', '\u0145': 'N', '\u0147': 'N', '\u014a': 'N',
  '\u0144': 'n', '\u0146': 'n', '\u0148': 'n', '\u014b': 'n',
  '\u014c': 'O', '\u014e': 'O', '\u0150': 'O',
  '\u014d': 'o', '\u014f': 'o', '\u0151': 'o',
  '\u0154': 'R', '\u0156': 'R', '\u0158': 'R',
  '\u0155': 'r', '\u0157': 'r', '\u0159': 'r',
  '\u015a': 'S', '\u015c': 'S', '\u015e': 'S', '\u0160': 'S',
  '\u015b': 's', '\u015d': 's', '\u015f': 's', '\u0161': 's',
  '\u0162': 'T', '\u0164': 'T', '\u0166': 'T',
  '\u0163': 't', '\u0165': 't', '\u0167': 't',
  '\u0168': 'U', '\u016a': 'U', '\u016c': 'U', '\u016e': 'U', '\u0170': 'U', '\u0172': 'U',
  '\u0169': 'u', '\u016b': 'u', '\u016d': 'u', '\u016f': 'u', '\u0171': 'u', '\u0173': 'u',
  '\u0174': 'W', '\u0175': 'w',
  '\u0176': 'Y', '\u0177': 'y', '\u0178': 'Y',
  '\u0179': 'Z', '\u017b': 'Z', '\u017d': 'Z',
  '\u017a': 'z', '\u017c': 'z', '\u017e': 'z',
  '\u0132': 'IJ', '\u0133': 'ij',
  '\u0152': 'Oe', '\u0153': 'oe',
  '\u0149': "'n", '\u017f': 'ss'
};

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/**
 * A specialized version of `_.reduce` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @param {boolean} [initAccum] Specify using the first element of `array` as
 *  the initial value.
 * @returns {*} Returns the accumulated value.
 */
function arrayReduce(array, iteratee, accumulator, initAccum) {
  var index = -1,
      length = array ? array.length : 0;

  if (initAccum && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }
  return accumulator;
}

/**
 * Splits an ASCII `string` into an array of its words.
 *
 * @private
 * @param {string} The string to inspect.
 * @returns {Array} Returns the words of `string`.
 */
function asciiWords(string) {
  return string.match(reAsciiWord) || [];
}

/**
 * The base implementation of `_.propertyOf` without support for deep paths.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Function} Returns the new accessor function.
 */
function basePropertyOf(object) {
  return function (key) {
    return object == null ? undefined : object[key];
  };
}

/**
 * Used by `_.deburr` to convert Latin-1 Supplement and Latin Extended-A
 * letters to basic Latin letters.
 *
 * @private
 * @param {string} letter The matched letter to deburr.
 * @returns {string} Returns the deburred letter.
 */
var deburrLetter = basePropertyOf(deburredLetters);

/**
 * Checks if `string` contains a word composed of Unicode symbols.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {boolean} Returns `true` if a word is found, else `false`.
 */
function hasUnicodeWord(string) {
  return reHasUnicodeWord.test(string);
}

/**
 * Splits a Unicode `string` into an array of its words.
 *
 * @private
 * @param {string} The string to inspect.
 * @returns {Array} Returns the words of `string`.
 */
function unicodeWords(string) {
  return string.match(reUnicodeWord) || [];
}

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var Symbol = root.Symbol;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = value + '';
  return result == '0' && 1 / value == -INFINITY ? '-0' : result;
}

/**
 * Creates a function like `_.camelCase`.
 *
 * @private
 * @param {Function} callback The function to combine each word.
 * @returns {Function} Returns the new compounder function.
 */
function createCompounder(callback) {
  return function (string) {
    return arrayReduce(words(deburr(string).replace(reApos, '')), callback, '');
  };
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' || isObjectLike(value) && objectToString.call(value) == symbolTag;
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

/**
 * Deburrs `string` by converting
 * [Latin-1 Supplement](https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table)
 * and [Latin Extended-A](https://en.wikipedia.org/wiki/Latin_Extended-A)
 * letters to basic Latin letters and removing
 * [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks).
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to deburr.
 * @returns {string} Returns the deburred string.
 * @example
 *
 * _.deburr('déjà vu');
 * // => 'deja vu'
 */
function deburr(string) {
  string = toString(string);
  return string && string.replace(reLatin, deburrLetter).replace(reComboMark, '');
}

/**
 * Converts `string` to
 * [kebab case](https://en.wikipedia.org/wiki/Letter_case#Special_case_styles).
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to convert.
 * @returns {string} Returns the kebab cased string.
 * @example
 *
 * _.kebabCase('Foo Bar');
 * // => 'foo-bar'
 *
 * _.kebabCase('fooBar');
 * // => 'foo-bar'
 *
 * _.kebabCase('__FOO_BAR__');
 * // => 'foo-bar'
 */
var kebabCase = createCompounder(function (result, word, index) {
  return result + (index ? '-' : '') + word.toLowerCase();
});

/**
 * Splits `string` into an array of its words.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to inspect.
 * @param {RegExp|string} [pattern] The pattern to match words.
 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
 * @returns {Array} Returns the words of `string`.
 * @example
 *
 * _.words('fred, barney, & pebbles');
 * // => ['fred', 'barney', 'pebbles']
 *
 * _.words('fred, barney, & pebbles', /[^, ]+/g);
 * // => ['fred', 'barney', '&', 'pebbles']
 */
function words(string, pattern, guard) {
  string = toString(string);
  pattern = guard ? undefined : pattern;

  if (pattern === undefined) {
    return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
  }
  return string.match(pattern) || [];
}

module.exports = kebabCase;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__("./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "../../src/component.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash_clonedeep__ = __webpack_require__("../../node_modules/lodash.clonedeep/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash_clonedeep___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_lodash_clonedeep__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_kwak__ = __webpack_require__("../../node_modules/kwak/lib/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utilities__ = __webpack_require__("../../src/utilities.js");






const Component = (component = {}) => {

  const { element, definition, hooks, attributes = {} } = component;
  let { properties = {} } = definition;
  let { verbose } = definition;
  let _isAttached = false;
  let _isRendered = false;
  let _isInitializing = false;
  let _whenInitialized;
  let _properties;

  const _attributesNames = Object.freeze(Object.keys(attributes));

  const _getProperties = () => {

    Object(__WEBPACK_IMPORTED_MODULE_1_kwak__["a" /* assert */])(!Object(__WEBPACK_IMPORTED_MODULE_1_kwak__["l" /* isUndefined */])(_properties), `Cannot get properties during creation`);
    Object(__WEBPACK_IMPORTED_MODULE_1_kwak__["a" /* assert */])(!_isInitializing, `Cannot get properties during initialization`);

    return Object(__WEBPACK_IMPORTED_MODULE_2__utilities__["a" /* clone */])(_properties);
  };

  Object.defineProperties(component, {
    properties: { get: _getProperties },
    isRendered: { get: () => _isRendered },
    isInitializing: { get: () => _isInitializing },
    isAttached: { get: () => _isAttached }
  });

  component.detach = () => {

    if (!Object(__WEBPACK_IMPORTED_MODULE_1_kwak__["h" /* isNull */])(_attributeObserver)) _attributeObserver.disconnect();

    _isRendered = _isAttached = false;

    if (verbose) console.log('detach', { _isAttached, _isRendered });

    hooks.detach(component);
  };

  component.attach = () => {

    const _attach = () => {

      hooks.attach(component, (shouldRender = true) => {

        if (verbose) console.log('attach', _properties, { _isAttached, _isRendered, shouldRender });

        _isAttached = true;

        if (!_isRendered && shouldRender) component.render();

        if (!Object(__WEBPACK_IMPORTED_MODULE_1_kwak__["h" /* isNull */])(_attributeObserver)) _attributeObserver.observe(element, { attributes: true, attributeOldValue: true });
      });
    };

    if (!_isInitializing) return _attach();

    _whenInitialized.then(_attach);
  };

  component.render = () => {

    if (verbose) console.log('render()', { _isAttached, _isRendered, properties: JSON.stringify(_properties), state: JSON.stringify(component.state) });

    if (!_isAttached) return;

    hooks.render(component);

    _isRendered = true;
  };

  component.initialize = (properties, options = {}) => {

    Object(__WEBPACK_IMPORTED_MODULE_1_kwak__["a" /* assert */])(Object(__WEBPACK_IMPORTED_MODULE_1_kwak__["i" /* isObject */])(properties), `'properties' must be an object`);
    Object(__WEBPACK_IMPORTED_MODULE_1_kwak__["a" /* assert */])(Object(__WEBPACK_IMPORTED_MODULE_1_kwak__["i" /* isObject */])(options), `'options' must be an object`);

    const { partial = false } = options;

    if (verbose) console.log('initialize()', { _isInitializing, properties, partial });

    Object(__WEBPACK_IMPORTED_MODULE_1_kwak__["a" /* assert */])(!_isInitializing, `Cannot call initialize during initialization`);

    if (_isInitializing) return void Object.assign(_properties, properties);

    const oldProperties = component.properties;

    _whenInitialized = new Promise((resolve, reject) => {

      _isInitializing = true;
      //console.log('IS INITIALIZING !!!');

      const { partial = false } = options;

      let newProperties = !partial ? Object(__WEBPACK_IMPORTED_MODULE_2__utilities__["a" /* clone */])(properties) : Object.assign({}, _properties, properties);

      newProperties = Object.keys(newProperties).filter(key => _propertiesKeys.includes(key)).reduce((before, key) => Object.assign(before, { [key]: newProperties[key] }), {});

      hooks.initialize(component, newProperties, oldProperties, (shouldRender = true) => {

        Object.assign(_properties, newProperties);

        _isInitializing = false;
        //console.log('IS NO MORE INITIALIZING');

        resolve();

        if (shouldRender) component.render();else {

          if (verbose) console.warn('initialize has not rendered component');
        }
      });
    });
  };

  component.isPwet = true;

  Object.freeze(component);

  properties = Object.keys(properties).reduce((before, key) => {

    let property = properties[key](component);

    if (!Object(__WEBPACK_IMPORTED_MODULE_1_kwak__["j" /* isPlainObject */])(property)) property = { value: property };

    if (Object(__WEBPACK_IMPORTED_MODULE_1_kwak__["l" /* isUndefined */])(property.configurable)) property.configurable = true;

    Object.defineProperty(element, key, {
      get: () => _properties[key],
      set: newValue => component.initialize({ [key]: newValue }, { partial: true })
    });

    property.enumerable = true;

    before[key] = property;

    return before;
  }, {});

  let _propertiesKeys = Object.keys(properties);
  _properties = Object.defineProperties({}, properties);

  //component.initialize(_properties, _properties);

  // Use of MutationObserver instead of observedAttributes because
  // the call to initialize is debounced when multiple changes occurs at the same time.
  const _attributeObserver = Object(__WEBPACK_IMPORTED_MODULE_1_kwak__["e" /* isEmpty */])(attributes) ? null : new MutationObserver(mutations => {

    if (_isInitializing) return;

    mutations = mutations.filter(({ attributeName }) => _attributesNames.includes(attributeName)).map(({ attributeName: name, oldValue }) => ({
      name,
      oldValue,
      value: element.getAttribute(name)
    })).filter(({ value, oldValue }) => !Object(__WEBPACK_IMPORTED_MODULE_1_kwak__["f" /* isEqualTo */])(value, oldValue));

    if (Object(__WEBPACK_IMPORTED_MODULE_1_kwak__["e" /* isEmpty */])(mutations)) return;

    if (verbose) console.log('attributesChanged', mutations.map(({ name, value }) => `${name}=${value}`));

    //attributes[attributeName](this.pwet, newValue, oldValue);

    Promise.all(mutations.map(({ name, value, oldValue }) => {
      return attributes[name](component, value, oldValue);
    })).then(all => {

      let mustInitialize = false;

      const properties = all.reduce((before, result) => {

        if (Object(__WEBPACK_IMPORTED_MODULE_1_kwak__["j" /* isPlainObject */])(result)) {
          mustInitialize = true;
          Object.assign(before, result);
        }

        return before;
      }, {});

      if (verbose) console.log('attributesChanged => properties', properties);

      if (mustInitialize) component.initialize(properties, { partial: true });
    });
  });

  return component;
};

/* harmony default export */ __webpack_exports__["a"] = (Component);

/***/ }),

/***/ "../../src/definition.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash_kebabcase__ = __webpack_require__("../../node_modules/lodash.kebabcase/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash_kebabcase___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_lodash_kebabcase__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utilities__ = __webpack_require__("../../src/utilities.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__component__ = __webpack_require__("../../src/component.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_kwak__ = __webpack_require__("../../node_modules/kwak/lib/index.js");
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };







const _definitions = [];

const _parseHooks = (hooks = {}, defaultHooks = {}) => {

  Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["a" /* assert */])(Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["i" /* isObject */])(hooks), `'hooks' must be an object`);
  Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["a" /* assert */])(Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["i" /* isObject */])(defaultHooks), `'defaultHooks' must be an object`);

  return Object.keys(defaultHooks).reduce((before, key) => {

    const hook = hooks[key] || defaultHooks[key];

    Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["a" /* assert */])(Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["g" /* isFunction */])(hook), `'${key}' must be a function`);

    before[key] = hook;

    return before;
  }, {});
};

const Definition = (options = {}) => {

  options = Definition.parseDefinition(options);

  if (Definition.isDefinition(options)) return options;

  const { properties = {}, attributes = {}, dependencies = {}, verbose } = options;
  let { tagName, type = HTMLElement, style = '' } = options;

  Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["a" /* assert */])(Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["k" /* isString */])(tagName) && !Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["e" /* isEmpty */])(tagName), `'tagName' must be a non empty string`);

  // Tag
  tagName = __WEBPACK_IMPORTED_MODULE_0_lodash_kebabcase___default()(tagName.toLowerCase());
  if (!tagName.includes('-')) tagName = `x-${tagName}`;
  Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["a" /* assert */])(!Definition.getDefinition(tagName), `'${tagName}' definition already exists`);

  // Type
  Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["a" /* assert */])(Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["g" /* isFunction */])(type) && (type === HTMLElement || Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["d" /* isElement */])(type.prototype)), `'type' must be a subclass of HTMLElement`);

  // Properties
  Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["a" /* assert */])(Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["i" /* isObject */])(properties), `'properties' must be an object`);
  Object.keys(properties).forEach(key => {
    let property = properties[key];

    if (!Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["g" /* isFunction */])(property)) {

      if (!Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["j" /* isPlainObject */])(property)) property = { value: property };

      properties[key] = () => property;
    }
  });

  // Attributes
  Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["a" /* assert */])(Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["i" /* isObject */])(attributes), `'attributes' must be an object`);
  Object.keys(attributes).forEach(key => {
    const attribute = attributes[key];

    Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["a" /* assert */])(Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["g" /* isFunction */])(attribute), `Invalid 'attributes': ${key}' must be a function`);
  });

  // Style
  Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["a" /* assert */])(Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["l" /* isUndefined */])(style) || Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["k" /* isString */])(style), `'style' must be a string`);

  // Hooks
  const hooks = _parseHooks(options.hooks, Definition.defaultHooks);

  type = class extends type {
    constructor() {

      super();

      this.pwet = hooks.create({
        element: this,
        definition,
        style: definition.style,
        hooks: Object(__WEBPACK_IMPORTED_MODULE_1__utilities__["a" /* clone */])(hooks),
        attributes
      });
    }
    connectedCallback() {

      this.pwet.attach(this.pwet);
    }
    disconnectedCallback() {

      this.pwet.detach(this.pwet);
    }
  };

  const definition = {
    tagName,
    style,
    type,
    hooks,
    attributes,
    properties,
    verbose
  };

  Object.freeze(definition);

  _definitions.push(definition);

  return definition;
};

Definition.parseDefinition = (definition = {}) => {

  if (Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["g" /* isFunction */])(definition)) {
    definition = _extends({}, definition, {
      hooks: _extends({}, definition.hooks, {
        create: definition
      })
    });
  }
  Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["a" /* assert */])(Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["i" /* isObject */])(definition), `'definition' must be an object`);

  return definition;
};

Definition.getDefinition = input => _definitions.find(definition => definition.tagName === input);
Definition.isDefinition = input => _definitions.includes(input);
Definition.defaultHooks = {
  create: __WEBPACK_IMPORTED_MODULE_2__component__["a" /* default */],
  define: __WEBPACK_IMPORTED_MODULE_1__utilities__["c" /* identity */],
  attach: (component, attach) => attach(),
  detach: __WEBPACK_IMPORTED_MODULE_1__utilities__["d" /* noop */],
  render: __WEBPACK_IMPORTED_MODULE_1__utilities__["d" /* noop */],
  initialize: (component, properties, oldProperties, initialize) => {

    const arePropertiesEqual = Object(__WEBPACK_IMPORTED_MODULE_3_kwak__["c" /* isDeeplyEqual */])(properties, oldProperties);

    if (!arePropertiesEqual) console.warn('initialize aborted because properties are unchanged');

    initialize(!component.isRendered || !arePropertiesEqual);
  }
};

/* harmony default export */ __webpack_exports__["a"] = (Definition);

/***/ }),

/***/ "../../src/index.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return defineComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__definition__ = __webpack_require__("../../src/definition.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__component__ = __webpack_require__("../../src/component.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_kwak__ = __webpack_require__("../../node_modules/kwak/lib/index.js");
/* unused harmony reexport Component */
/* unused harmony reexport Definition */


var _arguments = arguments;




const defineComponent = (definition, options = {}) => {

  definition = Object(__WEBPACK_IMPORTED_MODULE_0__definition__["a" /* default */])(definition);

  let { tagName } = definition;

  if (Object(__WEBPACK_IMPORTED_MODULE_2_kwak__["k" /* isString */])(options)) {
    tagName = options;
    options = _arguments.length > 2 ? _arguments[2] : null;
  }

  Object(__WEBPACK_IMPORTED_MODULE_2_kwak__["a" /* assert */])(Object(__WEBPACK_IMPORTED_MODULE_2_kwak__["i" /* isObject */])(options), `'options' must be an object`);

  definition = definition.hooks.define(definition);

  customElements.define(definition.tagName, definition.type, options);

  return definition;
};



/***/ }),

/***/ "../../src/utilities.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_kwak__ = __webpack_require__("../../node_modules/kwak/lib/index.js");


const clone = input => !Object(__WEBPACK_IMPORTED_MODULE_0_kwak__["b" /* isArray */])(input) ? Object(__WEBPACK_IMPORTED_MODULE_0_kwak__["i" /* isObject */])(input) && !Object(__WEBPACK_IMPORTED_MODULE_0_kwak__["h" /* isNull */])(input) ? Object.assign({}, input) : input : input.map(clone);
/* harmony export (immutable) */ __webpack_exports__["a"] = clone;


const noop = () => {};
/* harmony export (immutable) */ __webpack_exports__["d"] = noop;

const identity = arg => arg;
/* harmony export (immutable) */ __webpack_exports__["c"] = identity;

const toggle = input => !input;
/* unused harmony export toggle */

const not = fn => (...args) => !fn(...args);
/* unused harmony export not */

const isAttached = (element, container = document) => {

  return container.contains(element);
};
/* unused harmony export isAttached */


const decorate = (before, ...decorators) => {

  Object(__WEBPACK_IMPORTED_MODULE_0_kwak__["a" /* assert */])(Object(__WEBPACK_IMPORTED_MODULE_0_kwak__["g" /* isFunction */])(before), `'before' must be a function`);

  Object(__WEBPACK_IMPORTED_MODULE_0_kwak__["a" /* assert */])(!Object(__WEBPACK_IMPORTED_MODULE_0_kwak__["e" /* isEmpty */])(decorators) && decorators.every(__WEBPACK_IMPORTED_MODULE_0_kwak__["g" /* isFunction */]), `decorate only accepts functions as parameters`);

  return decorators.reduce((before, fn) => fn.bind(null, before), before);
};
/* harmony export (immutable) */ __webpack_exports__["b"] = decorate;


/***/ }),

/***/ "./node_modules/@webcomponents/webcomponentsjs/webcomponents-sd-ce.js":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {(function () {
  /*
  Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */
  'use strict';
  var mb = "undefined" != typeof window && window === this ? this : "undefined" != typeof global && null != global ? global : this;
  (function () {
    function k() {
      var a = this;this.m = {};this.g = document.documentElement;var b = new va();b.rules = [];this.h = v.set(this.g, new v(b));this.i = !1;this.b = this.a = null;nb(function () {
        a.c();
      });
    }function E() {
      this.customStyles = [];this.enqueued = !1;
    }function ob() {}function da(a) {
      this.cache = {};this.c = void 0 === a ? 100 : a;
    }function p() {}function v(a, b, c, d, e) {
      this.D = a || null;this.b = b || null;this.ja = c || [];this.L = null;this.U = e || "";this.a = this.A = this.H = null;
    }function t() {}function va() {
      this.end = this.start = 0;this.rules = this.parent = this.previous = null;this.cssText = this.parsedCssText = "";this.atRule = !1;this.type = 0;this.parsedSelector = this.selector = this.keyframesName = "";
    }function Vc(a) {
      function b(b, c) {
        Object.defineProperty(b, "innerHTML", { enumerable: c.enumerable, configurable: !0, get: c.get, set: function (b) {
            var d = this,
                e = void 0;r(this) && (e = [], M(this, function (a) {
              a !== d && e.push(a);
            }));c.set.call(this, b);if (e) for (var f = 0; f < e.length; f++) {
              var h = e[f];1 === h.__CE_state && a.disconnectedCallback(h);
            }this.ownerDocument.__CE_hasRegistry ? a.f(this) : a.l(this);
            return b;
          } });
      }function c(b, c) {
        x(b, "insertAdjacentElement", function (b, d) {
          var e = r(d);b = c.call(this, b, d);e && a.a(d);r(b) && a.b(d);return b;
        });
      }pb && x(Element.prototype, "attachShadow", function (a) {
        return this.__CE_shadowRoot = a = pb.call(this, a);
      });if (wa && wa.get) b(Element.prototype, wa);else if (xa && xa.get) b(HTMLElement.prototype, xa);else {
        var d = ya.call(document, "div");a.u(function (a) {
          b(a, { enumerable: !0, configurable: !0, get: function () {
              return qb.call(this, !0).innerHTML;
            }, set: function (a) {
              var b = "template" === this.localName ? this.content : this;for (d.innerHTML = a; 0 < b.childNodes.length;) za.call(b, b.childNodes[0]);for (; 0 < d.childNodes.length;) ea.call(b, d.childNodes[0]);
            } });
        });
      }x(Element.prototype, "setAttribute", function (b, c) {
        if (1 !== this.__CE_state) return rb.call(this, b, c);var d = Aa.call(this, b);rb.call(this, b, c);c = Aa.call(this, b);a.attributeChangedCallback(this, b, d, c, null);
      });x(Element.prototype, "setAttributeNS", function (b, c, d) {
        if (1 !== this.__CE_state) return sb.call(this, b, c, d);var e = fa.call(this, b, c);sb.call(this, b, c, d);d = fa.call(this, b, c);a.attributeChangedCallback(this, c, e, d, b);
      });x(Element.prototype, "removeAttribute", function (b) {
        if (1 !== this.__CE_state) return tb.call(this, b);var c = Aa.call(this, b);tb.call(this, b);null !== c && a.attributeChangedCallback(this, b, c, null, null);
      });x(Element.prototype, "removeAttributeNS", function (b, c) {
        if (1 !== this.__CE_state) return ub.call(this, b, c);var d = fa.call(this, b, c);ub.call(this, b, c);var e = fa.call(this, b, c);d !== e && a.attributeChangedCallback(this, c, d, e, b);
      });vb ? c(HTMLElement.prototype, vb) : wb ? c(Element.prototype, wb) : console.warn("Custom Elements: `Element#insertAdjacentElement` was not patched.");Ba(a, Element.prototype, { Y: Wc, append: Xc });Yc(a, { ha: Zc, Qa: $c, replaceWith: ad, remove: bd });
    }function Yc(a, b) {
      var c = Element.prototype;function d(b) {
        return function (c) {
          for (var d = [], e = 0; e < arguments.length; ++e) d[e - 0] = arguments[e];e = [];for (var f = [], q = 0; q < d.length; q++) {
            var n = d[q];n instanceof Element && r(n) && f.push(n);if (n instanceof DocumentFragment) for (n = n.firstChild; n; n = n.nextSibling) e.push(n);else e.push(n);
          }b.apply(this, d);for (d = 0; d < f.length; d++) a.a(f[d]);if (r(this)) for (d = 0; d < e.length; d++) f = e[d], f instanceof Element && a.b(f);
        };
      }void 0 !== b.ha && (c.before = d(b.ha));void 0 !== b.ha && (c.after = d(b.Qa));void 0 !== b.replaceWith && x(c, "replaceWith", function (c) {
        for (var d = [], e = 0; e < arguments.length; ++e) d[e - 0] = arguments[e];e = [];for (var g = [], l = 0; l < d.length; l++) {
          var q = d[l];q instanceof Element && r(q) && g.push(q);if (q instanceof DocumentFragment) for (q = q.firstChild; q; q = q.nextSibling) e.push(q);else e.push(q);
        }l = r(this);b.replaceWith.apply(this, d);for (d = 0; d < g.length; d++) a.a(g[d]);if (l) for (a.a(this), d = 0; d < e.length; d++) g = e[d], g instanceof Element && a.b(g);
      });void 0 !== b.remove && x(c, "remove", function () {
        var c = r(this);b.remove.call(this);c && a.a(this);
      });
    }function cd(a) {
      function b(b, d) {
        Object.defineProperty(b, "textContent", { enumerable: d.enumerable, configurable: !0, get: d.get, set: function (b) {
            if (this.nodeType === Node.TEXT_NODE) d.set.call(this, b);else {
              var c = void 0;if (this.firstChild) {
                var e = this.childNodes,
                    g = e.length;if (0 < g && r(this)) {
                  c = Array(g);for (var l = 0; l < g; l++) c[l] = e[l];
                }
              }d.set.call(this, b);if (c) for (b = 0; b < c.length; b++) a.a(c[b]);
            }
          } });
      }x(Node.prototype, "insertBefore", function (b, d) {
        if (b instanceof DocumentFragment) {
          var c = Array.prototype.slice.apply(b.childNodes);b = xb.call(this, b, d);if (r(this)) for (d = 0; d < c.length; d++) a.b(c[d]);return b;
        }c = r(b);d = xb.call(this, b, d);c && a.a(b);r(this) && a.b(b);return d;
      });x(Node.prototype, "appendChild", function (b) {
        if (b instanceof DocumentFragment) {
          var c = Array.prototype.slice.apply(b.childNodes);b = ea.call(this, b);if (r(this)) for (var e = 0; e < c.length; e++) a.b(c[e]);return b;
        }c = r(b);e = ea.call(this, b);c && a.a(b);r(this) && a.b(b);return e;
      });x(Node.prototype, "cloneNode", function (b) {
        b = qb.call(this, b);this.ownerDocument.__CE_hasRegistry ? a.f(b) : a.l(b);return b;
      });x(Node.prototype, "removeChild", function (b) {
        var c = r(b),
            e = za.call(this, b);c && a.a(b);return e;
      });x(Node.prototype, "replaceChild", function (b, d) {
        if (b instanceof DocumentFragment) {
          var c = Array.prototype.slice.apply(b.childNodes);b = yb.call(this, b, d);if (r(this)) for (a.a(d), d = 0; d < c.length; d++) a.b(c[d]);
          return b;
        }c = r(b);var f = yb.call(this, b, d),
            h = r(this);h && a.a(d);c && a.a(b);h && a.b(b);return f;
      });Ca && Ca.get ? b(Node.prototype, Ca) : a.u(function (a) {
        b(a, { enumerable: !0, configurable: !0, get: function () {
            for (var a = [], b = 0; b < this.childNodes.length; b++) a.push(this.childNodes[b].textContent);return a.join("");
          }, set: function (a) {
            for (; this.firstChild;) za.call(this, this.firstChild);ea.call(this, document.createTextNode(a));
          } });
      });
    }function dd(a) {
      x(Document.prototype, "createElement", function (b) {
        if (this.__CE_hasRegistry) {
          var c = a.c(b);if (c) return new c.constructor();
        }b = ya.call(this, b);a.g(b);return b;
      });x(Document.prototype, "importNode", function (b, c) {
        b = ed.call(this, b, c);this.__CE_hasRegistry ? a.f(b) : a.l(b);return b;
      });x(Document.prototype, "createElementNS", function (b, c) {
        if (this.__CE_hasRegistry && (null === b || "http://www.w3.org/1999/xhtml" === b)) {
          var d = a.c(c);if (d) return new d.constructor();
        }b = fd.call(this, b, c);a.g(b);return b;
      });Ba(a, Document.prototype, { Y: gd, append: hd });
    }function Ba(a, b, c) {
      function d(b) {
        return function (c) {
          for (var d = [], e = 0; e < arguments.length; ++e) d[e - 0] = arguments[e];e = [];for (var f = [], q = 0; q < d.length; q++) {
            var n = d[q];n instanceof Element && r(n) && f.push(n);if (n instanceof DocumentFragment) for (n = n.firstChild; n; n = n.nextSibling) e.push(n);else e.push(n);
          }b.apply(this, d);for (d = 0; d < f.length; d++) a.a(f[d]);if (r(this)) for (d = 0; d < e.length; d++) f = e[d], f instanceof Element && a.b(f);
        };
      }void 0 !== c.Y && (b.prepend = d(c.Y));void 0 !== c.append && (b.append = d(c.append));
    }function id(a) {
      window.HTMLElement = function () {
        function b() {
          var b = this.constructor,
              d = a.w(b);if (!d) throw Error("The custom element being constructed was not registered with `customElements`.");var e = d.constructionStack;if (0 === e.length) return e = ya.call(document, d.localName), Object.setPrototypeOf(e, b.prototype), e.__CE_state = 1, e.__CE_definition = d, a.g(e), e;d = e.length - 1;var f = e[d];if (f === zb) throw Error("The HTMLElement constructor was either called reentrantly for this constructor or called multiple times.");e[d] = zb;Object.setPrototypeOf(f, b.prototype);a.g(f);return f;
        }b.prototype = jd.prototype;
        return b;
      }();
    }function y(a) {
      this.c = !1;this.a = a;this.h = new Map();this.f = function (a) {
        return a();
      };this.b = !1;this.g = [];this.i = new Da(a, document);
    }function Ab() {
      var a = this;this.b = this.a = void 0;this.f = new Promise(function (b) {
        a.b = b;a.a && b(a.a);
      });
    }function Da(a, b) {
      this.b = a;this.a = b;this.K = void 0;this.b.f(this.a);"loading" === this.a.readyState && (this.K = new MutationObserver(this.f.bind(this)), this.K.observe(this.a, { childList: !0, subtree: !0 }));
    }function A() {
      this.o = new Map();this.m = new Map();this.j = [];this.h = !1;
    }function m(a, b, c) {
      if (a !== Bb) throw new TypeError("Illegal constructor");a = document.createDocumentFragment();a.__proto__ = m.prototype;a.B(b, c);return a;
    }function ha(a) {
      if (!a.__shady || void 0 === a.__shady.firstChild) {
        a.__shady = a.__shady || {};a.__shady.firstChild = Ea(a);a.__shady.lastChild = Fa(a);Cb(a);for (var b = a.__shady.childNodes = Q(a), c = 0, d; c < b.length && (d = b[c]); c++) d.__shady = d.__shady || {}, d.__shady.parentNode = a, d.__shady.nextSibling = b[c + 1] || null, d.__shady.previousSibling = b[c - 1] || null, Db(d);
      }
    }function kd(a) {
      var b = a && a.K;
      b && (b.W.delete(a.La), b.W.size || (a.Ma.__shady.S = null));
    }function ld(a, b) {
      a.__shady = a.__shady || {};a.__shady.S || (a.__shady.S = new ia());a.__shady.S.W.add(b);var c = a.__shady.S;return { La: b, K: c, Ma: a, takeRecords: function () {
          return c.takeRecords();
        } };
    }function ia() {
      this.a = !1;this.addedNodes = [];this.removedNodes = [];this.W = new Set();
    }function R(a) {
      return a.__shady && void 0 !== a.__shady.firstChild;
    }function G(a) {
      return "ShadyRoot" === a.Ha;
    }function X(a) {
      a = a.getRootNode();if (G(a)) return a;
    }function Ga(a, b) {
      if (a && b) for (var c = Object.getOwnPropertyNames(b), d = 0, e; d < c.length && (e = c[d]); d++) {
        var f = Object.getOwnPropertyDescriptor(b, e);f && Object.defineProperty(a, e, f);
      }
    }function Ha(a, b) {
      for (var c = [], d = 1; d < arguments.length; ++d) c[d - 1] = arguments[d];for (d = 0; d < c.length; d++) Ga(a, c[d]);return a;
    }function md(a, b) {
      for (var c in b) a[c] = b[c];
    }function Eb(a) {
      Ia.push(a);Ja.textContent = Fb++;
    }function Gb(a) {
      Ka || (Ka = !0, Eb(ja));Y.push(a);
    }function ja() {
      Ka = !1;for (var a = !!Y.length; Y.length;) Y.shift()();return a;
    }function nd(a, b) {
      var c = b.getRootNode();
      return a.map(function (a) {
        var b = c === a.target.getRootNode();if (b && a.addedNodes) {
          if (b = Array.from(a.addedNodes).filter(function (a) {
            return c === a.getRootNode();
          }), b.length) return a = Object.create(a), Object.defineProperty(a, "addedNodes", { value: b, configurable: !0 }), a;
        } else if (b) return a;
      }).filter(function (a) {
        return a;
      });
    }function Hb(a) {
      switch (a) {case "&":
          return "&amp;";case "<":
          return "&lt;";case ">":
          return "&gt;";case '"':
          return "&quot;";case "\u00a0":
          return "&nbsp;";}
    }function Ib(a) {
      for (var b = {}, c = 0; c < a.length; c++) b[a[c]] = !0;return b;
    }function La(a, b) {
      "template" === a.localName && (a = a.content);for (var c = "", d = b ? b(a) : a.childNodes, e = 0, f = d.length, h; e < f && (h = d[e]); e++) {
        a: {
          var g = h;var l = a;var q = b;switch (g.nodeType) {case Node.ELEMENT_NODE:
              for (var n = g.localName, k = "<" + n, m = g.attributes, p = 0; l = m[p]; p++) k += " " + l.name + '="' + l.value.replace(od, Hb) + '"';k += ">";g = pd[n] ? k : k + La(g, q) + "</" + n + ">";break a;case Node.TEXT_NODE:
              g = g.data;g = l && qd[l.localName] ? g : g.replace(rd, Hb);break a;case Node.COMMENT_NODE:
              g = "\x3c!--" + g.data + "--\x3e";break a;default:
              throw window.console.error(g), Error("not implemented");}
        }c += g;
      }return c;
    }function S(a) {
      B.currentNode = a;return B.parentNode();
    }function Ea(a) {
      B.currentNode = a;return B.firstChild();
    }function Fa(a) {
      B.currentNode = a;return B.lastChild();
    }function Jb(a) {
      B.currentNode = a;return B.previousSibling();
    }function Kb(a) {
      B.currentNode = a;return B.nextSibling();
    }function Q(a) {
      var b = [];B.currentNode = a;for (a = B.firstChild(); a;) b.push(a), a = B.nextSibling();return b;
    }function Lb(a) {
      C.currentNode = a;return C.parentNode();
    }function Mb(a) {
      C.currentNode = a;return C.firstChild();
    }
    function Nb(a) {
      C.currentNode = a;return C.lastChild();
    }function Ob(a) {
      C.currentNode = a;return C.previousSibling();
    }function Pb(a) {
      C.currentNode = a;return C.nextSibling();
    }function Qb(a) {
      var b = [];C.currentNode = a;for (a = C.firstChild(); a;) b.push(a), a = C.nextSibling();return b;
    }function Rb(a) {
      return La(a, function (a) {
        return Q(a);
      });
    }function Sb(a) {
      switch (a.nodeType) {case Node.ELEMENT_NODE:case Node.DOCUMENT_FRAGMENT_NODE:
          a = document.createTreeWalker(a, NodeFilter.SHOW_TEXT, null, !1);for (var b = "", c; c = a.nextNode();) b += c.nodeValue;return b;default:
          return a.nodeValue;}
    }function J(a, b, c) {
      for (var d in b) {
        var e = Object.getOwnPropertyDescriptor(a, d);e && e.configurable || !e && c ? Object.defineProperty(a, d, b[d]) : c && console.warn("Could not define", d, "on", a);
      }
    }function N(a) {
      J(a, Tb);J(a, Ma);J(a, Na);
    }function Ub(a, b, c) {
      Db(a);c = c || null;a.__shady = a.__shady || {};b.__shady = b.__shady || {};c && (c.__shady = c.__shady || {});a.__shady.previousSibling = c ? c.__shady.previousSibling : b.lastChild;var d = a.__shady.previousSibling;d && d.__shady && (d.__shady.nextSibling = a);(d = a.__shady.nextSibling = c) && d.__shady && (d.__shady.previousSibling = a);a.__shady.parentNode = b;c ? c === b.__shady.firstChild && (b.__shady.firstChild = a) : (b.__shady.lastChild = a, b.__shady.firstChild || (b.__shady.firstChild = a));b.__shady.childNodes = null;
    }function Oa(a, b, c) {
      if (b === a) throw Error("Failed to execute 'appendChild' on 'Node': The new child element contains the parent.");if (c) {
        var d = c.__shady && c.__shady.parentNode;if (void 0 !== d && d !== a || void 0 === d && S(c) !== a) throw Error("Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.");
      }if (c === b) return b;b.parentNode && Pa(b.parentNode, b);d = X(a);var e;if (e = d) a: {
        if (!b.__noInsertionPoint) {
          var f;"slot" === b.localName ? f = [b] : b.querySelectorAll && (f = b.querySelectorAll("slot"));if (f && f.length) {
            e = f;break a;
          }
        }e = void 0;
      }f = e;d && ("slot" === a.localName || f) && d.J();if (R(a)) {
        e = c;Cb(a);a.__shady = a.__shady || {};void 0 !== a.__shady.firstChild && (a.__shady.childNodes = null);if (b.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
          for (var h = b.childNodes, g = 0; g < h.length; g++) Ub(h[g], a, e);b.__shady = b.__shady || {};e = void 0 !== b.__shady.firstChild ? null : void 0;b.__shady.firstChild = b.__shady.lastChild = e;b.__shady.childNodes = e;
        } else Ub(b, a, e);if (Qa(a)) {
          a.__shady.root.J();var l = !0;
        } else a.__shady.root && (l = !0);
      }l || (l = G(a) ? a.host : a, c ? (c = Vb(c), Ra.call(l, b, c)) : Wb.call(l, b));Xb(a, b);f && d.Ka(f);return b;
    }function Pa(a, b) {
      if (b.parentNode !== a) throw Error("The node to be removed is not a child of this node: " + b);var c = X(b);if (R(a)) {
        b.__shady = b.__shady || {};a.__shady = a.__shady || {};b === a.__shady.firstChild && (a.__shady.firstChild = b.__shady.nextSibling);b === a.__shady.lastChild && (a.__shady.lastChild = b.__shady.previousSibling);var d = b.__shady.previousSibling;var e = b.__shady.nextSibling;d && (d.__shady = d.__shady || {}, d.__shady.nextSibling = e);e && (e.__shady = e.__shady || {}, e.__shady.previousSibling = d);b.__shady.parentNode = b.__shady.previousSibling = b.__shady.nextSibling = void 0;void 0 !== a.__shady.childNodes && (a.__shady.childNodes = null);if (Qa(a)) {
          a.__shady.root.J();var f = !0;
        }
      }Yb(b);c && ((e = a && "slot" === a.localName) && (f = !0), ((d = c.Na(b)) || e) && c.J());f || (f = G(a) ? a.host : a, (!a.__shady.root && "slot" !== b.localName || f === S(b)) && Z.call(f, b));Xb(a, null, b);return b;
    }function Yb(a) {
      if (a.__shady && void 0 !== a.__shady.ka) for (var b = a.childNodes, c = 0, d = b.length, e; c < d && (e = b[c]); c++) Yb(e);a.__shady && (a.__shady.ka = void 0);
    }function Vb(a) {
      var b = a;a && "slot" === a.localName && (b = (b = a.__shady && a.__shady.P) && b.length ? b[0] : Vb(a.nextSibling));return b;
    }function Qa(a) {
      return (a = a && a.__shady && a.__shady.root) && a.pa();
    }function Zb(a, b) {
      "slot" === b ? (a = a.parentNode, Qa(a) && a.__shady.root.J()) : "slot" === a.localName && "name" === b && (b = X(a)) && (b.Pa(a), b.J());
    }function Xb(a, b, c) {
      if (a = a.__shady && a.__shady.S) b && a.addedNodes.push(b), c && a.removedNodes.push(c), a.$a();
    }function $b(a) {
      if (a && a.nodeType) {
        a.__shady = a.__shady || {};var b = a.__shady.ka;void 0 === b && (G(a) ? b = a : b = (b = a.parentNode) ? $b(b) : a, document.documentElement.contains(a) && (a.__shady.ka = b));return b;
      }
    }function ka(a, b, c) {
      var d = [];ac(a.childNodes, b, c, d);return d;
    }function ac(a, b, c, d) {
      for (var e = 0, f = a.length, h; e < f && (h = a[e]); e++) {
        var g;if (g = h.nodeType === Node.ELEMENT_NODE) {
          g = h;var l = b,
              q = c,
              k = d,
              m = l(g);m && k.push(g);q && q(m) ? g = m : (ac(g.childNodes, l, q, k), g = void 0);
        }if (g) break;
      }
    }function bc(a) {
      a = a.getRootNode();G(a) && a.ra();
    }function cc(a, b, c) {
      la || (la = window.ShadyCSS && window.ShadyCSS.ScopingShim);la && "class" === b ? la.setElementClass(a, c) : (dc.call(a, b, c), Zb(a, b));
    }function ec(a, b) {
      if (a.ownerDocument !== document) return Sa.call(document, a, b);var c = Sa.call(document, a, !1);if (b) {
        a = a.childNodes;b = 0;for (var d; b < a.length; b++) d = ec(a[b], !0), c.appendChild(d);
      }return c;
    }function Ta(a, b) {
      var c = [],
          d = a;for (a = a === window ? window : a.getRootNode(); d;) c.push(d), d = d.assignedSlot ? d.assignedSlot : d.nodeType === Node.DOCUMENT_FRAGMENT_NODE && d.host && (b || d !== a) ? d.host : d.parentNode;c[c.length - 1] === document && c.push(window);return c;
    }function fc(a, b) {
      if (!G) return a;a = Ta(a, !0);for (var c = 0, d, e, f, h; c < b.length; c++) if (d = b[c], f = d === window ? window : d.getRootNode(), f !== e && (h = a.indexOf(f), e = f), !G(f) || -1 < h) return d;
    }function Ua(a) {
      function b(b, d) {
        b = new a(b, d);b.da = d && !!d.composed;return b;
      }md(b, a);b.prototype = a.prototype;return b;
    }function gc(a, b, c) {
      if (c = b.__handlers && b.__handlers[a.type] && b.__handlers[a.type][c]) for (var d = 0, e; (e = c[d]) && a.target !== a.relatedTarget && (e.call(b, a), !a.Fa); d++);
    }function sd(a) {
      var b = a.composedPath();Object.defineProperty(a, "currentTarget", { get: function () {
          return d;
        }, configurable: !0 });for (var c = b.length - 1; 0 <= c; c--) {
        var d = b[c];gc(a, d, "capture");if (a.ea) return;
      }Object.defineProperty(a, "eventPhase", { get: function () {
          return Event.AT_TARGET;
        } });var e;for (c = 0; c < b.length; c++) {
        d = b[c];var f = d.__shady && d.__shady.root;if (0 === c || f && f === e) if (gc(a, d, "bubble"), d !== window && (e = d.getRootNode()), a.ea) break;
      }
    }function hc(a, b, c, d, e, f) {
      for (var h = 0; h < a.length; h++) {
        var g = a[h],
            l = g.type,
            q = g.capture,
            k = g.once,
            m = g.passive;if (b === g.node && c === l && d === q && e === k && f === m) return h;
      }return -1;
    }function ic(a, b, c) {
      if (b) {
        if ("object" === typeof c) {
          var d = !!c.capture;var e = !!c.once;var f = !!c.passive;
        } else d = !!c, f = e = !1;var h = c && c.fa || this,
            g = b[aa];if (g) {
          if (-1 < hc(g, h, a, d, e, f)) return;
        } else b[aa] = [];g = function (d) {
          e && this.removeEventListener(a, b, c);d.__target || jc(d);
          if (h !== this) {
            var f = Object.getOwnPropertyDescriptor(d, "currentTarget");Object.defineProperty(d, "currentTarget", { get: function () {
                return h;
              }, configurable: !0 });
          }if (d.composed || -1 < d.composedPath().indexOf(h)) if (d.target === d.relatedTarget) d.eventPhase === Event.BUBBLING_PHASE && d.stopImmediatePropagation();else if (d.eventPhase === Event.CAPTURING_PHASE || d.bubbles || d.target === h) {
            var g = "object" === typeof b && b.handleEvent ? b.handleEvent(d) : b.call(h, d);h !== this && (f ? (Object.defineProperty(d, "currentTarget", f), f = null) : delete d.currentTarget);return g;
          }
        };b[aa].push({ node: this, type: a, capture: d, once: e, passive: f, eb: g });Va[a] ? (this.__handlers = this.__handlers || {}, this.__handlers[a] = this.__handlers[a] || { capture: [], bubble: [] }, this.__handlers[a][d ? "capture" : "bubble"].push(g)) : (this instanceof Window ? kc : lc).call(this, a, g, c);
      }
    }function mc(a, b, c) {
      if (b) {
        if ("object" === typeof c) {
          var d = !!c.capture;var e = !!c.once;var f = !!c.passive;
        } else d = !!c, f = e = !1;var h = c && c.fa || this,
            g = void 0;var l = null;try {
          l = b[aa];
        } catch (q) {}l && (e = hc(l, h, a, d, e, f), -1 < e && (g = l.splice(e, 1)[0].eb, l.length || (b[aa] = void 0)));(this instanceof Window ? nc : oc).call(this, a, g || b, c);g && Va[a] && this.__handlers && this.__handlers[a] && (a = this.__handlers[a][d ? "capture" : "bubble"], g = a.indexOf(g), -1 < g && a.splice(g, 1));
      }
    }function td() {
      for (var a in Va) window.addEventListener(a, function (a) {
        a.__target || (jc(a), sd(a));
      }, !0);
    }function jc(a) {
      a.__target = a.target;a.na = a.relatedTarget;if (D.R) {
        var b = pc,
            c = Object.getPrototypeOf(a);if (!c.hasOwnProperty("__patchProto")) {
          var d = Object.create(c);d.gb = c;Ga(d, b);c.__patchProto = d;
        }a.__proto__ = c.__patchProto;
      } else Ga(a, pc);
    }function ba(a, b) {
      return { index: a, T: [], V: b };
    }function ud(a, b, c, d) {
      var e = 0,
          f = 0,
          h = 0,
          g = 0,
          l = Math.min(b - e, d - f);if (0 == e && 0 == f) a: {
        for (h = 0; h < l; h++) if (a[h] !== c[h]) break a;h = l;
      }if (b == a.length && d == c.length) {
        g = a.length;for (var k = c.length, n = 0; n < l - h && vd(a[--g], c[--k]);) n++;g = n;
      }e += h;f += h;b -= g;d -= g;if (0 == b - e && 0 == d - f) return [];if (e == b) {
        for (b = ba(e, 0); f < d;) b.T.push(c[f++]);return [b];
      }if (f == d) return [ba(e, b - e)];l = e;h = f;d = d - h + 1;g = b - l + 1;b = Array(d);for (k = 0; k < d; k++) b[k] = Array(g), b[k][0] = k;for (k = 0; k < g; k++) b[0][k] = k;for (k = 1; k < d; k++) for (n = 1; n < g; n++) if (a[l + n - 1] === c[h + k - 1]) b[k][n] = b[k - 1][n - 1];else {
        var m = b[k - 1][n] + 1,
            p = b[k][n - 1] + 1;b[k][n] = m < p ? m : p;
      }l = b.length - 1;h = b[0].length - 1;d = b[l][h];for (a = []; 0 < l || 0 < h;) 0 == l ? (a.push(2), h--) : 0 == h ? (a.push(3), l--) : (g = b[l - 1][h - 1], k = b[l - 1][h], n = b[l][h - 1], m = k < n ? k < g ? k : g : n < g ? n : g, m == g ? (g == d ? a.push(0) : (a.push(1), d = g), l--, h--) : m == k ? (a.push(3), l--, d = k) : (a.push(2), h--, d = n));a.reverse();b = void 0;l = [];for (h = 0; h < a.length; h++) switch (a[h]) {case 0:
          b && (l.push(b), b = void 0);e++;f++;break;case 1:
          b || (b = ba(e, 0));b.V++;e++;b.T.push(c[f]);f++;break;case 2:
          b || (b = ba(e, 0));b.V++;e++;break;case 3:
          b || (b = ba(e, 0)), b.T.push(c[f]), f++;}b && l.push(b);return l;
    }function vd(a, b) {
      return a === b;
    }function qc(a) {
      var b = [];do b.unshift(a); while (a = a.parentNode);return b;
    }function rc(a) {
      bc(a);return a.__shady && a.__shady.assignedSlot || null;
    }function K(a, b) {
      for (var c = Object.getOwnPropertyNames(b), d = 0; d < c.length; d++) {
        var e = c[d],
            f = Object.getOwnPropertyDescriptor(b, e);f.value ? a[e] = f.value : Object.defineProperty(a, e, f);
      }
    }function wd() {
      var a = window.customElements && window.customElements.nativeHTMLElement || HTMLElement;K(window.Node.prototype, xd);K(window.Window.prototype, yd);K(window.Text.prototype, zd);K(window.DocumentFragment.prototype, Wa);K(window.Element.prototype, sc);K(window.Document.prototype, tc);window.HTMLSlotElement && K(window.HTMLSlotElement.prototype, uc);K(a.prototype, Ad);D.R && (N(window.Node.prototype), N(window.Text.prototype), N(window.DocumentFragment.prototype), N(window.Element.prototype), N(a.prototype), N(window.Document.prototype), window.HTMLSlotElement && N(window.HTMLSlotElement.prototype));
    }function vc(a) {
      var b = Bd.has(a);a = /^[a-z][.0-9_a-z]*-[\-.0-9_a-z]*$/.test(a);return !b && a;
    }function r(a) {
      var b = a.isConnected;if (void 0 !== b) return b;for (; a && !(a.__CE_isImportDocument || a instanceof Document);) a = a.parentNode || (window.ShadowRoot && a instanceof ShadowRoot ? a.host : void 0);return !(!a || !(a.__CE_isImportDocument || a instanceof Document));
    }function Xa(a, b) {
      for (; b && b !== a && !b.nextSibling;) b = b.parentNode;
      return b && b !== a ? b.nextSibling : null;
    }function M(a, b, c) {
      c = c ? c : new Set();for (var d = a; d;) {
        if (d.nodeType === Node.ELEMENT_NODE) {
          var e = d;b(e);var f = e.localName;if ("link" === f && "import" === e.getAttribute("rel")) {
            d = e.import;if (d instanceof Node && !c.has(d)) for (c.add(d), d = d.firstChild; d; d = d.nextSibling) M(d, b, c);d = Xa(a, e);continue;
          } else if ("template" === f) {
            d = Xa(a, e);continue;
          }if (e = e.__CE_shadowRoot) for (e = e.firstChild; e; e = e.nextSibling) M(e, b, c);
        }d = d.firstChild ? d.firstChild : Xa(a, d);
      }
    }function x(a, b, c) {
      a[b] = c;
    }function Ya(a) {
      a = a.replace(F.Sa, "").replace(F.port, "");var b = wc,
          c = a,
          d = new va();d.start = 0;d.end = c.length;for (var e = d, f = 0, h = c.length; f < h; f++) if ("{" === c[f]) {
        e.rules || (e.rules = []);var g = e,
            k = g.rules[g.rules.length - 1] || null;e = new va();e.start = f + 1;e.parent = g;e.previous = k;g.rules.push(e);
      } else "}" === c[f] && (e.end = f + 1, e = e.parent || d);return b(d, a);
    }function wc(a, b) {
      var c = b.substring(a.start, a.end - 1);a.parsedCssText = a.cssText = c.trim();a.parent && (c = b.substring(a.previous ? a.previous.end : a.parent.start, a.start - 1), c = Cd(c), c = c.replace(F.xa, " "), c = c.substring(c.lastIndexOf(";") + 1), c = a.parsedSelector = a.selector = c.trim(), a.atRule = 0 === c.indexOf("@"), a.atRule ? 0 === c.indexOf("@media") ? a.type = I.MEDIA_RULE : c.match(F.Wa) && (a.type = I.ca, a.keyframesName = a.selector.split(F.xa).pop()) : a.type = 0 === c.indexOf("--") ? I.la : I.STYLE_RULE);if (c = a.rules) for (var d = 0, e = c.length, f; d < e && (f = c[d]); d++) wc(f, b);return a;
    }function Cd(a) {
      return a.replace(/\\([0-9a-f]{1,6})\s/gi, function (a, c) {
        a = c;for (c = 6 - a.length; c--;) a = "0" + a;return "\\" + a;
      });
    }function xc(a, b, c) {
      c = void 0 === c ? "" : c;var d = "";if (a.cssText || a.rules) {
        var e = a.rules,
            f;if (f = e) f = e[0], f = !(f && f.selector && 0 === f.selector.indexOf("--"));if (f) {
          f = 0;for (var h = e.length, g; f < h && (g = e[f]); f++) d = xc(g, b, d);
        } else b ? b = a.cssText : (b = a.cssText, b = b.replace(F.sa, "").replace(F.wa, ""), b = b.replace(F.Xa, "").replace(F.bb, "")), (d = b.trim()) && (d = "  " + d + "\n");
      }d && (a.selector && (c += a.selector + " {\n"), c += d, a.selector && (c += "}\n\n"));return c;
    }function yc(a) {
      z = a && a.shimcssproperties ? !1 : w || !(navigator.userAgent.match(/AppleWebKit\/601|Edge\/15/) || !window.CSS || !CSS.supports || !CSS.supports("box-shadow", "0 0 0 var(--foo)"));
    }function T(a, b) {
      if (!a) return "";"string" === typeof a && (a = Ya(a));b && U(a, b);return xc(a, z);
    }function ma(a) {
      !a.__cssRules && a.textContent && (a.__cssRules = Ya(a.textContent));return a.__cssRules || null;
    }function zc(a) {
      return !!a.parent && a.parent.type === I.ca;
    }function U(a, b, c, d) {
      if (a) {
        var e = !1,
            f = a.type;if (d && f === I.MEDIA_RULE) {
          var h = a.selector.match(Dd);h && (window.matchMedia(h[1]).matches || (e = !0));
        }f === I.STYLE_RULE ? b(a) : c && f === I.ca ? c(a) : f === I.la && (e = !0);if ((a = a.rules) && !e) {
          e = 0;f = a.length;for (var g; e < f && (g = a[e]); e++) U(g, b, c, d);
        }
      }
    }function Za(a, b, c, d) {
      var e = document.createElement("style");b && e.setAttribute("scope", b);e.textContent = a;Ac(e, c, d);return e;
    }function Ac(a, b, c) {
      b = b || document.head;b.insertBefore(a, c && c.nextSibling || b.firstChild);O ? a.compareDocumentPosition(O) === Node.DOCUMENT_POSITION_PRECEDING && (O = a) : O = a;
    }function Bc(a, b) {
      var c = a.indexOf("var(");if (-1 === c) return b(a, "", "", "");a: {
        var d = 0;var e = c + 3;for (var f = a.length; e < f; e++) if ("(" === a[e]) d++;else if (")" === a[e] && 0 === --d) break a;e = -1;
      }d = a.substring(c + 4, e);c = a.substring(0, c);a = Bc(a.substring(e + 1), b);e = d.indexOf(",");return -1 === e ? b(c, d.trim(), "", a) : b(c, d.substring(0, e).trim(), d.substring(e + 1).trim(), a);
    }function na(a, b) {
      w ? a.setAttribute("class", b) : window.ShadyDOM.nativeMethods.setAttribute.call(a, "class", b);
    }function P(a) {
      var b = a.localName,
          c = "";b ? -1 < b.indexOf("-") || (c = b, b = a.getAttribute && a.getAttribute("is") || "") : (b = a.is, c = a.extends);return { is: b, U: c };
    }function Cc(a) {
      for (var b = 0; b < a.length; b++) {
        var c = a[b];if (c.target !== document.documentElement && c.target !== document.head) for (var d = 0; d < c.addedNodes.length; d++) {
          var e = c.addedNodes[d];if (e.nodeType === Node.ELEMENT_NODE) {
            var f = e.getRootNode();var h = e;var g = [];h.classList ? g = Array.from(h.classList) : h instanceof window.SVGElement && h.hasAttribute("class") && (g = h.getAttribute("class").split(/\s+/));h = g;g = h.indexOf(u.a);if ((h = -1 < g ? h[g + 1] : "") && f === e.ownerDocument) u.b(e, h, !0);else if (f.nodeType === Node.DOCUMENT_FRAGMENT_NODE && (f = f.host)) if (f = P(f).is, h === f) for (e = window.ShadyDOM.nativeMethods.querySelectorAll.call(e, ":not(." + u.a + ")"), f = 0; f < e.length; f++) u.h(e[f], h);else h && u.b(e, h, !0), u.b(e, f);
          }
        }
      }
    }function Ed(a) {
      if (a = oa[a]) a._applyShimCurrentVersion = a._applyShimCurrentVersion || 0, a._applyShimValidatingVersion = a._applyShimValidatingVersion || 0, a._applyShimNextVersion = (a._applyShimNextVersion || 0) + 1;
    }function Dc(a) {
      return a._applyShimCurrentVersion === a._applyShimNextVersion;
    }function Fd(a) {
      a._applyShimValidatingVersion = a._applyShimNextVersion;a.b || (a.b = !0, Gd.then(function () {
        a._applyShimCurrentVersion = a._applyShimNextVersion;a.b = !1;
      }));
    }function nb(a) {
      requestAnimationFrame(function () {
        Ec ? Ec(a) : ($a || ($a = new Promise(function (a) {
          ab = a;
        }), "complete" === document.readyState ? ab() : document.addEventListener("readystatechange", function () {
          "complete" === document.readyState && ab();
        })), $a.then(function () {
          a && a();
        }));
      });
    }function Fc() {
      requestAnimationFrame(function () {
        window.WebComponents.ready = !0;window.document.dispatchEvent(new CustomEvent("WebComponentsReady", { bubbles: !0 }));
      });
    }function Gc() {
      Fc();bb.removeEventListener("readystatechange", Gc);
    }var D = window.ShadyDOM || {};D.Ta = !(!Element.prototype.attachShadow || !Node.prototype.getRootNode);var cb = Object.getOwnPropertyDescriptor(Node.prototype, "firstChild");D.R = !!(cb && cb.configurable && cb.get);D.va = D.force || !D.Ta;var V = Element.prototype,
        Hc = V.matches || V.matchesSelector || V.mozMatchesSelector || V.msMatchesSelector || V.oMatchesSelector || V.webkitMatchesSelector,
        Ja = document.createTextNode(""),
        Fb = 0,
        Ia = [];new MutationObserver(function () {
      for (; Ia.length;) try {
        Ia.shift()();
      } catch (a) {
        throw Ja.textContent = Fb++, a;
      }
    }).observe(Ja, { characterData: !0 });var Y = [],
        Ka;ja.list = Y;ia.prototype.$a = function () {
      var a = this;this.a || (this.a = !0, Eb(function () {
        a.b();
      }));
    };ia.prototype.b = function () {
      if (this.a) {
        this.a = !1;var a = this.takeRecords();a.length && this.W.forEach(function (b) {
          b(a);
        });
      }
    };ia.prototype.takeRecords = function () {
      if (this.addedNodes.length || this.removedNodes.length) {
        var a = [{ addedNodes: this.addedNodes, removedNodes: this.removedNodes }];this.addedNodes = [];this.removedNodes = [];return a;
      }return [];
    };var Wb = Element.prototype.appendChild,
        Ra = Element.prototype.insertBefore,
        Z = Element.prototype.removeChild,
        dc = Element.prototype.setAttribute,
        Ic = Element.prototype.removeAttribute,
        db = Element.prototype.cloneNode,
        Sa = Document.prototype.importNode,
        lc = Element.prototype.addEventListener,
        oc = Element.prototype.removeEventListener,
        kc = Window.prototype.addEventListener,
        nc = Window.prototype.removeEventListener,
        eb = Element.prototype.dispatchEvent,
        Hd = Object.freeze({ appendChild: Wb, insertBefore: Ra, removeChild: Z, setAttribute: dc, removeAttribute: Ic, cloneNode: db,
      importNode: Sa, addEventListener: lc, removeEventListener: oc, kb: kc, lb: nc, dispatchEvent: eb, querySelector: Element.prototype.querySelector, querySelectorAll: Element.prototype.querySelectorAll }),
        od = /[&\u00A0"]/g,
        rd = /[&\u00A0<>]/g,
        pd = Ib("area base br col command embed hr img input keygen link meta param source track wbr".split(" ")),
        qd = Ib("style script xmp iframe noembed noframes plaintext noscript".split(" ")),
        B = document.createTreeWalker(document, NodeFilter.SHOW_ALL, null, !1),
        C = document.createTreeWalker(document, NodeFilter.SHOW_ELEMENT, null, !1),
        Id = Object.freeze({ parentNode: S, firstChild: Ea, lastChild: Fa, previousSibling: Jb, nextSibling: Kb, childNodes: Q, parentElement: Lb, firstElementChild: Mb, lastElementChild: Nb, previousElementSibling: Ob, nextElementSibling: Pb, children: Qb, innerHTML: Rb, textContent: Sb }),
        fb = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML") || Object.getOwnPropertyDescriptor(HTMLElement.prototype, "innerHTML"),
        pa = document.implementation.createHTMLDocument("inert").createElement("div"),
        gb = Object.getOwnPropertyDescriptor(Document.prototype, "activeElement"),
        Tb = { parentElement: { get: function () {
          var a = this.__shady && this.__shady.parentNode;a && a.nodeType !== Node.ELEMENT_NODE && (a = null);return void 0 !== a ? a : Lb(this);
        }, configurable: !0 }, parentNode: { get: function () {
          var a = this.__shady && this.__shady.parentNode;return void 0 !== a ? a : S(this);
        }, configurable: !0 }, nextSibling: { get: function () {
          var a = this.__shady && this.__shady.nextSibling;return void 0 !== a ? a : Kb(this);
        }, configurable: !0 }, previousSibling: { get: function () {
          var a = this.__shady && this.__shady.previousSibling;
          return void 0 !== a ? a : Jb(this);
        }, configurable: !0 }, className: { get: function () {
          return this.getAttribute("class") || "";
        }, set: function (a) {
          this.setAttribute("class", a);
        }, configurable: !0 }, nextElementSibling: { get: function () {
          if (this.__shady && void 0 !== this.__shady.nextSibling) {
            for (var a = this.nextSibling; a && a.nodeType !== Node.ELEMENT_NODE;) a = a.nextSibling;return a;
          }return Pb(this);
        }, configurable: !0 }, previousElementSibling: { get: function () {
          if (this.__shady && void 0 !== this.__shady.previousSibling) {
            for (var a = this.previousSibling; a && a.nodeType !== Node.ELEMENT_NODE;) a = a.previousSibling;return a;
          }return Ob(this);
        }, configurable: !0 } },
        Ma = { childNodes: { get: function () {
          if (R(this)) {
            if (!this.__shady.childNodes) {
              this.__shady.childNodes = [];for (var a = this.firstChild; a; a = a.nextSibling) this.__shady.childNodes.push(a);
            }var b = this.__shady.childNodes;
          } else b = Q(this);b.item = function (a) {
            return b[a];
          };return b;
        }, configurable: !0 }, childElementCount: { get: function () {
          return this.children.length;
        }, configurable: !0 }, firstChild: { get: function () {
          var a = this.__shady && this.__shady.firstChild;return void 0 !== a ? a : Ea(this);
        }, configurable: !0 }, lastChild: { get: function () {
          var a = this.__shady && this.__shady.lastChild;return void 0 !== a ? a : Fa(this);
        }, configurable: !0 }, textContent: { get: function () {
          if (R(this)) {
            for (var a = [], b = 0, c = this.childNodes, d; d = c[b]; b++) d.nodeType !== Node.COMMENT_NODE && a.push(d.textContent);return a.join("");
          }return Sb(this);
        }, set: function (a) {
          switch (this.nodeType) {case Node.ELEMENT_NODE:case Node.DOCUMENT_FRAGMENT_NODE:
              for (; this.firstChild;) this.removeChild(this.firstChild);
              (0 < a.length || this.nodeType === Node.ELEMENT_NODE) && this.appendChild(document.createTextNode(a));break;default:
              this.nodeValue = a;}
        }, configurable: !0 }, firstElementChild: { get: function () {
          if (this.__shady && void 0 !== this.__shady.firstChild) {
            for (var a = this.firstChild; a && a.nodeType !== Node.ELEMENT_NODE;) a = a.nextSibling;return a;
          }return Mb(this);
        }, configurable: !0 }, lastElementChild: { get: function () {
          if (this.__shady && void 0 !== this.__shady.lastChild) {
            for (var a = this.lastChild; a && a.nodeType !== Node.ELEMENT_NODE;) a = a.previousSibling;
            return a;
          }return Nb(this);
        }, configurable: !0 }, children: { get: function () {
          var a;R(this) ? a = Array.prototype.filter.call(this.childNodes, function (a) {
            return a.nodeType === Node.ELEMENT_NODE;
          }) : a = Qb(this);a.item = function (b) {
            return a[b];
          };return a;
        }, configurable: !0 }, innerHTML: { get: function () {
          var a = "template" === this.localName ? this.content : this;return R(this) ? La(a) : Rb(a);
        }, set: function (a) {
          for (var b = "template" === this.localName ? this.content : this; b.firstChild;) b.removeChild(b.firstChild);for (fb && fb.set ? fb.set.call(pa, a) : pa.innerHTML = a; pa.firstChild;) b.appendChild(pa.firstChild);
        }, configurable: !0 } },
        Jc = { shadowRoot: { get: function () {
          return this.__shady && this.__shady.Ya || null;
        }, configurable: !0 } },
        Na = { activeElement: { get: function () {
          var a = gb && gb.get ? gb.get.call(document) : D.R ? void 0 : document.activeElement;if (a && a.nodeType) {
            var b = !!G(this);if (this === document || b && this.host !== a && this.host.contains(a)) {
              for (b = X(a); b && b !== this;) a = b.host, b = X(a);a = this === document ? b ? null : a : b === this ? a : null;
            } else a = null;
          } else a = null;return a;
        }, set: function () {},
        configurable: !0 } },
        Db = D.R ? function () {} : function (a) {
      a.__shady && a.__shady.Ia || (a.__shady = a.__shady || {}, a.__shady.Ia = !0, J(a, Tb, !0));
    },
        Cb = D.R ? function () {} : function (a) {
      a.__shady && a.__shady.Ga || (a.__shady = a.__shady || {}, a.__shady.Ga = !0, J(a, Ma, !0), J(a, Jc, !0));
    },
        la = null,
        aa = "__eventWrappers" + Date.now(),
        Jd = { blur: !0, focus: !0, focusin: !0, focusout: !0, click: !0, dblclick: !0, mousedown: !0, mouseenter: !0, mouseleave: !0, mousemove: !0, mouseout: !0, mouseover: !0, mouseup: !0, wheel: !0, beforeinput: !0, input: !0, keydown: !0, keyup: !0, compositionstart: !0,
      compositionupdate: !0, compositionend: !0, touchstart: !0, touchend: !0, touchmove: !0, touchcancel: !0, pointerover: !0, pointerenter: !0, pointerdown: !0, pointermove: !0, pointerup: !0, pointercancel: !0, pointerout: !0, pointerleave: !0, gotpointercapture: !0, lostpointercapture: !0, dragstart: !0, drag: !0, dragenter: !0, dragleave: !0, dragover: !0, drop: !0, dragend: !0, DOMActivate: !0, DOMFocusIn: !0, DOMFocusOut: !0, keypress: !0 },
        pc = { get composed() {
        !1 !== this.isTrusted && void 0 === this.da && (this.da = Jd[this.type]);return this.da || !1;
      }, composedPath: function () {
        this.ma || (this.ma = Ta(this.__target, this.composed));return this.ma;
      }, get target() {
        return fc(this.currentTarget, this.composedPath());
      }, get relatedTarget() {
        if (!this.na) return null;this.oa || (this.oa = Ta(this.na, !0));return fc(this.currentTarget, this.oa);
      }, stopPropagation: function () {
        Event.prototype.stopPropagation.call(this);this.ea = !0;
      }, stopImmediatePropagation: function () {
        Event.prototype.stopImmediatePropagation.call(this);this.ea = this.Fa = !0;
      } },
        Va = { focus: !0, blur: !0 },
        Kd = Ua(window.Event),
        Ld = Ua(window.CustomEvent),
        Md = Ua(window.MouseEvent),
        Bb = {};m.prototype = Object.create(DocumentFragment.prototype);m.prototype.B = function (a, b) {
      this.Ha = "ShadyRoot";ha(a);ha(this);this.host = a;this.I = b && b.mode;a.__shady = a.__shady || {};a.__shady.root = this;a.__shady.Ya = "closed" !== this.I ? this : null;this.O = !1;this.b = [];this.a = null;b = Q(a);for (var c = 0, d = b.length; c < d; c++) Z.call(a, b[c]);
    };m.prototype.J = function () {
      var a = this;this.O || (this.O = !0, Gb(function () {
        return a.ra();
      }));
    };m.prototype.w = function () {
      for (var a = this, b = this; b;) b.O && (a = b), b = b.Oa();
      return a;
    };m.prototype.Oa = function () {
      var a = this.host.getRootNode();if (G(a)) for (var b = this.host.childNodes, c = 0, d; c < b.length; c++) if (d = b[c], this.h(d)) return a;
    };m.prototype.ra = function () {
      this.O && this.w()._renderRoot();
    };m.prototype._renderRoot = function () {
      this.O = !1;this.u();this.m();
    };m.prototype.u = function () {
      for (var a = 0, b; a < this.b.length; a++) b = this.b[a], this.l(b);for (b = this.host.firstChild; b; b = b.nextSibling) this.f(b);for (a = 0; a < this.b.length; a++) {
        b = this.b[a];if (!b.__shady.assignedNodes.length) for (var c = b.firstChild; c; c = c.nextSibling) this.f(c, b);c = b.parentNode;(c = c.__shady && c.__shady.root) && c.pa() && c._renderRoot();this.c(b.__shady.P, b.__shady.assignedNodes);if (c = b.__shady.qa) {
          for (var d = 0; d < c.length; d++) c[d].__shady.ga = null;b.__shady.qa = null;c.length > b.__shady.assignedNodes.length && (b.__shady.ia = !0);
        }b.__shady.ia && (b.__shady.ia = !1, this.g(b));
      }
    };m.prototype.f = function (a, b) {
      a.__shady = a.__shady || {};var c = a.__shady.ga;a.__shady.ga = null;b || (b = (b = this.a[a.slot || "__catchall"]) && b[0]);b ? (b.__shady.assignedNodes.push(a), a.__shady.assignedSlot = b) : a.__shady.assignedSlot = void 0;c !== a.__shady.assignedSlot && a.__shady.assignedSlot && (a.__shady.assignedSlot.__shady.ia = !0);
    };m.prototype.l = function (a) {
      var b = a.__shady.assignedNodes;a.__shady.assignedNodes = [];a.__shady.P = [];if (a.__shady.qa = b) for (var c = 0; c < b.length; c++) {
        var d = b[c];d.__shady.ga = d.__shady.assignedSlot;d.__shady.assignedSlot === a && (d.__shady.assignedSlot = null);
      }
    };m.prototype.c = function (a, b) {
      for (var c = 0, d; c < b.length && (d = b[c]); c++) "slot" == d.localName ? this.c(a, d.__shady.assignedNodes) : a.push(b[c]);
    };
    m.prototype.g = function (a) {
      eb.call(a, new Event("slotchange"));a.__shady.assignedSlot && this.g(a.__shady.assignedSlot);
    };m.prototype.m = function () {
      for (var a = this.b, b = [], c = 0; c < a.length; c++) {
        var d = a[c].parentNode;d.__shady && d.__shady.root || !(0 > b.indexOf(d)) || b.push(d);
      }for (a = 0; a < b.length; a++) c = b[a], this.G(c === this ? this.host : c, this.o(c));
    };m.prototype.o = function (a) {
      var b = [];a = a.childNodes;for (var c = 0; c < a.length; c++) {
        var d = a[c];if (this.h(d)) {
          d = d.__shady.P;for (var e = 0; e < d.length; e++) b.push(d[e]);
        } else b.push(d);
      }return b;
    };
    m.prototype.h = function (a) {
      return "slot" == a.localName;
    };m.prototype.G = function (a, b) {
      for (var c = Q(a), d = ud(b, b.length, c, c.length), e = 0, f = 0, h; e < d.length && (h = d[e]); e++) {
        for (var g = 0, k; g < h.T.length && (k = h.T[g]); g++) S(k) === a && Z.call(a, k), c.splice(h.index + f, 1);f -= h.V;
      }for (e = 0; e < d.length && (h = d[e]); e++) for (f = c[h.index], g = h.index; g < h.index + h.V; g++) k = b[g], Ra.call(a, k, f), c.splice(g, 0, k);
    };m.prototype.Ka = function (a) {
      this.a = this.a || {};this.b = this.b || [];for (var b = 0; b < a.length; b++) {
        var c = a[b];c.__shady = c.__shady || {};ha(c);
        ha(c.parentNode);var d = this.i(c);if (this.a[d]) {
          var e = e || {};e[d] = !0;this.a[d].push(c);
        } else this.a[d] = [c];this.b.push(c);
      }if (e) for (var f in e) this.a[f] = this.j(this.a[f]);
    };m.prototype.i = function (a) {
      var b = a.name || a.getAttribute("name") || "__catchall";return a.Ja = b;
    };m.prototype.j = function (a) {
      return a.sort(function (a, c) {
        a = qc(a);for (var b = qc(c), e = 0; e < a.length; e++) {
          c = a[e];var f = b[e];if (c !== f) return a = Array.from(c.parentNode.childNodes), a.indexOf(c) - a.indexOf(f);
        }
      });
    };m.prototype.Na = function (a) {
      this.a = this.a || {};this.b = this.b || [];var b = this.a,
          c;for (c in b) for (var d = b[c], e = 0; e < d.length; e++) {
        var f = d[e],
            h;a: {
          for (h = f; h;) {
            if (h == a) {
              h = !0;break a;
            }h = h.parentNode;
          }h = void 0;
        }if (h) {
          d.splice(e, 1);var g = this.b.indexOf(f);0 <= g && this.b.splice(g, 1);e--;this.F(f);g = !0;
        }
      }return g;
    };m.prototype.Pa = function (a) {
      var b = a.Ja,
          c = this.i(a);if (c !== b) {
        b = this.a[b];var d = b.indexOf(a);0 <= d && b.splice(d, 1);b = this.a[c] || (this.a[c] = []);b.push(a);1 < b.length && (this.a[c] = this.j(b));
      }
    };m.prototype.F = function (a) {
      if (a = a.__shady.P) for (var b = 0; b < a.length; b++) {
        var c = a[b],
            d = S(c);d && Z.call(d, c);
      }
    };m.prototype.pa = function () {
      return !!this.b.length;
    };m.prototype.addEventListener = function (a, b, c) {
      "object" !== typeof c && (c = { capture: !!c });c.fa = this;this.host.addEventListener(a, b, c);
    };m.prototype.removeEventListener = function (a, b, c) {
      "object" !== typeof c && (c = { capture: !!c });c.fa = this;this.host.removeEventListener(a, b, c);
    };m.prototype.getElementById = function (a) {
      return ka(this, function (b) {
        return b.id == a;
      }, function (a) {
        return !!a;
      })[0] || null;
    };(function (a) {
      J(a, Ma, !0);J(a, Na, !0);
    })(m.prototype);
    var yd = { addEventListener: ic.bind(window), removeEventListener: mc.bind(window) },
        xd = { addEventListener: ic, removeEventListener: mc, appendChild: function (a) {
        return Oa(this, a);
      }, insertBefore: function (a, b) {
        return Oa(this, a, b);
      }, removeChild: function (a) {
        return Pa(this, a);
      }, replaceChild: function (a, b) {
        Oa(this, a, b);Pa(this, b);return a;
      }, cloneNode: function (a) {
        if ("template" == this.localName) var b = db.call(this, a);else if (b = db.call(this, !1), a) {
          a = this.childNodes;for (var c = 0, d; c < a.length; c++) d = a[c].cloneNode(!0), b.appendChild(d);
        }return b;
      },
      getRootNode: function () {
        return $b(this);
      }, get isConnected() {
        var a = this.ownerDocument;if (a && a.contains && a.contains(this) || (a = a.documentElement) && a.contains && a.contains(this)) return !0;for (a = this; a && !(a instanceof Document);) a = a.parentNode || (a instanceof m ? a.host : void 0);return !!(a && a instanceof Document);
      }, dispatchEvent: function (a) {
        ja();return eb.call(this, a);
      } },
        zd = { get assignedSlot() {
        return rc(this);
      } },
        Wa = { querySelector: function (a) {
        return ka(this, function (b) {
          return Hc.call(b, a);
        }, function (a) {
          return !!a;
        })[0] || null;
      }, querySelectorAll: function (a) {
        return ka(this, function (b) {
          return Hc.call(b, a);
        });
      } },
        uc = { assignedNodes: function (a) {
        if ("slot" === this.localName) return bc(this), this.__shady ? (a && a.flatten ? this.__shady.P : this.__shady.assignedNodes) || [] : [];
      } },
        sc = Ha({ setAttribute: function (a, b) {
        cc(this, a, b);
      }, removeAttribute: function (a) {
        Ic.call(this, a);Zb(this, a);
      }, attachShadow: function (a) {
        if (!this) throw "Must provide a host.";if (!a) throw "Not enough arguments.";return new m(Bb, this, a);
      }, get slot() {
        return this.getAttribute("slot");
      },
      set slot(a) {
        cc(this, "slot", a);
      }, get assignedSlot() {
        return rc(this);
      } }, Wa, uc);Object.defineProperties(sc, Jc);var tc = Ha({ importNode: function (a, b) {
        return ec(a, b);
      }, getElementById: function (a) {
        return ka(this, function (b) {
          return b.id == a;
        }, function (a) {
          return !!a;
        })[0] || null;
      } }, Wa);Object.defineProperties(tc, { _activeElement: Na.activeElement });var Nd = HTMLElement.prototype.blur,
        Ad = Ha({ blur: function () {
        var a = this.__shady && this.__shady.root;(a = a && a.activeElement) ? a.blur() : Nd.call(this);
      } });D.va && (window.ShadyDOM = { inUse: D.va,
      patch: function (a) {
        return a;
      }, isShadyRoot: G, enqueue: Gb, flush: ja, settings: D, filterMutations: nd, observeChildren: ld, unobserveChildren: kd, nativeMethods: Hd, nativeTree: Id }, window.Event = Kd, window.CustomEvent = Ld, window.MouseEvent = Md, td(), wd(), window.ShadowRoot = m);var Bd = new Set("annotation-xml color-profile font-face font-face-src font-face-uri font-face-format font-face-name missing-glyph".split(" "));A.prototype.B = function (a, b) {
      this.o.set(a, b);this.m.set(b.constructor, b);
    };A.prototype.c = function (a) {
      return this.o.get(a);
    };
    A.prototype.w = function (a) {
      return this.m.get(a);
    };A.prototype.u = function (a) {
      this.h = !0;this.j.push(a);
    };A.prototype.l = function (a) {
      var b = this;this.h && M(a, function (a) {
        return b.g(a);
      });
    };A.prototype.g = function (a) {
      if (this.h && !a.__CE_patched) {
        a.__CE_patched = !0;for (var b = 0; b < this.j.length; b++) this.j[b](a);
      }
    };A.prototype.b = function (a) {
      var b = [];M(a, function (a) {
        return b.push(a);
      });for (a = 0; a < b.length; a++) {
        var c = b[a];1 === c.__CE_state ? this.connectedCallback(c) : this.i(c);
      }
    };A.prototype.a = function (a) {
      var b = [];M(a, function (a) {
        return b.push(a);
      });
      for (a = 0; a < b.length; a++) {
        var c = b[a];1 === c.__CE_state && this.disconnectedCallback(c);
      }
    };A.prototype.f = function (a, b) {
      var c = this;b = b ? b : {};var d = b.cb || new Set(),
          e = b.ya || function (a) {
        return c.i(a);
      },
          f = [];M(a, function (a) {
        if ("link" === a.localName && "import" === a.getAttribute("rel")) {
          var b = a.import;b instanceof Node && "complete" === b.readyState ? (b.__CE_isImportDocument = !0, b.__CE_hasRegistry = !0) : a.addEventListener("load", function () {
            var b = a.import;if (!b.__CE_documentLoadHandled) {
              b.__CE_documentLoadHandled = !0;b.__CE_isImportDocument = !0;b.__CE_hasRegistry = !0;var f = new Set(d);f.delete(b);c.f(b, { cb: f, ya: e });
            }
          });
        } else f.push(a);
      }, d);if (this.h) for (a = 0; a < f.length; a++) this.g(f[a]);for (a = 0; a < f.length; a++) e(f[a]);
    };A.prototype.i = function (a) {
      if (void 0 === a.__CE_state) {
        var b = this.c(a.localName);if (b) {
          b.constructionStack.push(a);var c = b.constructor;try {
            try {
              if (new c() !== a) throw Error("The custom element constructor did not produce the element being upgraded.");
            } finally {
              b.constructionStack.pop();
            }
          } catch (f) {
            throw a.__CE_state = 2, f;
          }a.__CE_state = 1;a.__CE_definition = b;if (b.attributeChangedCallback) for (b = b.observedAttributes, c = 0; c < b.length; c++) {
            var d = b[c],
                e = a.getAttribute(d);null !== e && this.attributeChangedCallback(a, d, null, e, null);
          }r(a) && this.connectedCallback(a);
        }
      }
    };A.prototype.connectedCallback = function (a) {
      var b = a.__CE_definition;b.connectedCallback && b.connectedCallback.call(a);
    };A.prototype.disconnectedCallback = function (a) {
      var b = a.__CE_definition;b.disconnectedCallback && b.disconnectedCallback.call(a);
    };A.prototype.attributeChangedCallback = function (a, b, c, d, e) {
      var f = a.__CE_definition;f.attributeChangedCallback && -1 < f.observedAttributes.indexOf(b) && f.attributeChangedCallback.call(a, b, c, d, e);
    };Da.prototype.c = function () {
      this.K && this.K.disconnect();
    };Da.prototype.f = function (a) {
      var b = this.a.readyState;"interactive" !== b && "complete" !== b || this.c();for (b = 0; b < a.length; b++) for (var c = a[b].addedNodes, d = 0; d < c.length; d++) this.b.f(c[d]);
    };Ab.prototype.c = function () {
      if (this.a) throw Error("Already resolved.");this.a = void 0;this.b && this.b(void 0);
    };y.prototype.define = function (a, b) {
      var c = this;if (!(b instanceof Function)) throw new TypeError("Custom element constructors must be functions.");if (!vc(a)) throw new SyntaxError("The element name '" + a + "' is not valid.");if (this.a.c(a)) throw Error("A custom element with name '" + a + "' has already been defined.");if (this.c) throw Error("A custom element is already being defined.");this.c = !0;try {
        var d = function (a) {
          var b = e[a];if (void 0 !== b && !(b instanceof Function)) throw Error("The '" + a + "' callback must be a function.");return b;
        },
            e = b.prototype;if (!(e instanceof Object)) throw new TypeError("The custom element constructor's prototype is not an object.");var f = d("connectedCallback");var h = d("disconnectedCallback");var g = d("adoptedCallback");var k = d("attributeChangedCallback");var m = b.observedAttributes || [];
      } catch (n) {
        return;
      } finally {
        this.c = !1;
      }b = { localName: a, constructor: b, connectedCallback: f, disconnectedCallback: h, adoptedCallback: g, attributeChangedCallback: k, observedAttributes: m, constructionStack: [] };this.a.B(a, b);this.g.push(b);this.b || (this.b = !0, this.f(function () {
        return c.j();
      }));
    };
    y.prototype.j = function () {
      var a = this;if (!1 !== this.b) {
        this.b = !1;for (var b = this.g, c = [], d = new Map(), e = 0; e < b.length; e++) d.set(b[e].localName, []);this.a.f(document, { ya: function (b) {
            if (void 0 === b.__CE_state) {
              var e = b.localName,
                  f = d.get(e);f ? f.push(b) : a.a.c(e) && c.push(b);
            }
          } });for (e = 0; e < c.length; e++) this.a.i(c[e]);for (; 0 < b.length;) {
          var f = b.shift();e = f.localName;f = d.get(f.localName);for (var h = 0; h < f.length; h++) this.a.i(f[h]);(e = this.h.get(e)) && e.c();
        }
      }
    };y.prototype.get = function (a) {
      if (a = this.a.c(a)) return a.constructor;
    };
    y.prototype.whenDefined = function (a) {
      if (!vc(a)) return Promise.reject(new SyntaxError("'" + a + "' is not a valid custom element name."));var b = this.h.get(a);if (b) return b.f;b = new Ab();this.h.set(a, b);this.a.c(a) && !this.g.some(function (b) {
        return b.localName === a;
      }) && b.c();return b.f;
    };y.prototype.l = function (a) {
      this.i.c();var b = this.f;this.f = function (c) {
        return a(function () {
          return b(c);
        });
      };
    };window.CustomElementRegistry = y;y.prototype.define = y.prototype.define;y.prototype.get = y.prototype.get;y.prototype.whenDefined = y.prototype.whenDefined;y.prototype.polyfillWrapFlushCallback = y.prototype.l;var ya = window.Document.prototype.createElement,
        fd = window.Document.prototype.createElementNS,
        ed = window.Document.prototype.importNode,
        gd = window.Document.prototype.prepend,
        hd = window.Document.prototype.append,
        Od = window.DocumentFragment.prototype.prepend,
        Pd = window.DocumentFragment.prototype.append,
        qb = window.Node.prototype.cloneNode,
        ea = window.Node.prototype.appendChild,
        xb = window.Node.prototype.insertBefore,
        za = window.Node.prototype.removeChild,
        yb = window.Node.prototype.replaceChild,
        Ca = Object.getOwnPropertyDescriptor(window.Node.prototype, "textContent"),
        pb = window.Element.prototype.attachShadow,
        wa = Object.getOwnPropertyDescriptor(window.Element.prototype, "innerHTML"),
        Aa = window.Element.prototype.getAttribute,
        rb = window.Element.prototype.setAttribute,
        tb = window.Element.prototype.removeAttribute,
        fa = window.Element.prototype.getAttributeNS,
        sb = window.Element.prototype.setAttributeNS,
        ub = window.Element.prototype.removeAttributeNS,
        wb = window.Element.prototype.insertAdjacentElement,
        Wc = window.Element.prototype.prepend,
        Xc = window.Element.prototype.append,
        Zc = window.Element.prototype.before,
        $c = window.Element.prototype.after,
        ad = window.Element.prototype.replaceWith,
        bd = window.Element.prototype.remove,
        jd = window.HTMLElement,
        xa = Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, "innerHTML"),
        vb = window.HTMLElement.prototype.insertAdjacentElement,
        zb = new function () {}(),
        qa = window.customElements;if (!qa || qa.forcePolyfill || "function" != typeof qa.define || "function" != typeof qa.get) {
      var W = new A();id(W);dd(W);Ba(W, DocumentFragment.prototype, { Y: Od, append: Pd });cd(W);Vc(W);document.__CE_hasRegistry = !0;var Qd = new y(W);Object.defineProperty(window, "customElements", { configurable: !0, enumerable: !0, value: Qd });
    }var I = { STYLE_RULE: 1, ca: 7, MEDIA_RULE: 4, la: 1E3 },
        F = { Sa: /\/\*[^*]*\*+([^/*][^*]*\*+)*\//gim, port: /@import[^;]*;/gim, sa: /(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?(?:[;\n]|$)/gim, wa: /(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?{[^}]*?}(?:[;\n]|$)?/gim, Xa: /@apply\s*\(?[^);]*\)?\s*(?:[;\n]|$)?/gim, bb: /[^;:]*?:[^;]*?var\([^;]*\)(?:[;\n]|$)?/gim,
      Wa: /^@[^\s]*keyframes/, xa: /\s+/g },
        w = !(window.ShadyDOM && window.ShadyDOM.inUse);if (window.ShadyCSS && void 0 !== window.ShadyCSS.nativeCss) var z = window.ShadyCSS.nativeCss;else window.ShadyCSS ? (yc(window.ShadyCSS), window.ShadyCSS = void 0) : yc(window.WebComponents && window.WebComponents.flags);var ra = /(?:^|[;\s{]\s*)(--[\w-]*?)\s*:\s*(?:((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};{])+)|\{([^}]*)\}(?:(?=[;\s}])|$))/gi,
        sa = /(?:^|\W+)@apply\s*\(?([^);\n]*)\)?/gi,
        Rd = /(--[\w-]+)\s*([:,;)]|$)/gi,
        Sd = /(animation\s*:)|(animation-name\s*:)/,
        Dd = /@media\s(.*)/,
        Td = /\{[^}]*\}/g,
        O = null;t.prototype.b = function (a, b, c) {
      a.__styleScoped ? a.__styleScoped = null : this.j(a, b || "", c);
    };t.prototype.j = function (a, b, c) {
      a.nodeType === Node.ELEMENT_NODE && this.h(a, b, c);if (a = "template" === a.localName ? (a.content || a.hb).childNodes : a.children || a.childNodes) for (var d = 0; d < a.length; d++) this.j(a[d], b, c);
    };t.prototype.h = function (a, b, c) {
      if (b) if (a.classList) c ? (a.classList.remove("style-scope"), a.classList.remove(b)) : (a.classList.add("style-scope"), a.classList.add(b));else if (a.getAttribute) {
        var d = a.getAttribute(Ud);c ? d && (b = d.replace("style-scope", "").replace(b, ""), na(a, b)) : na(a, (d ? d + " " : "") + "style-scope " + b);
      }
    };t.prototype.c = function (a, b, c) {
      var d = a.__cssBuild;w || "shady" === d ? b = T(b, c) : (a = P(a), b = this.G(b, a.is, a.U, c) + "\n\n");return b.trim();
    };t.prototype.G = function (a, b, c, d) {
      var e = this.f(b, c);b = this.i(b);var f = this;return T(a, function (a) {
        a.c || (f.N(a, b, e), a.c = !0);d && d(a, b, e);
      });
    };t.prototype.i = function (a) {
      return a ? Vd + a : "";
    };t.prototype.f = function (a, b) {
      return b ? "[is=" + a + "]" : a;
    };t.prototype.N = function (a, b, c) {
      this.l(a, this.g, b, c);
    };t.prototype.l = function (a, b, c, d) {
      a.selector = a.v = this.m(a, b, c, d);
    };t.prototype.m = function (a, b, c, d) {
      var e = a.selector.split(Kc);if (!zc(a)) {
        a = 0;for (var f = e.length, h; a < f && (h = e[a]); a++) e[a] = b.call(this, h, c, d);
      }return e.join(Kc);
    };t.prototype.u = function (a) {
      return a.replace(hb, function (a, c, d) {
        -1 < d.indexOf("+") ? d = d.replace(/\+/g, "___") : -1 < d.indexOf("___") && (d = d.replace(/___/g, "+"));return ":" + c + "(" + d + ")";
      });
    };t.prototype.g = function (a, b, c) {
      var d = this,
          e = !1;a = a.trim();var f = hb.test(a);f && (a = a.replace(hb, function (a, b, c) {
        return ":" + b + "(" + c.replace(/\s/g, "") + ")";
      }), a = this.u(a));a = a.replace(Wd, ib + " $1");a = a.replace(Xd, function (a, f, k) {
        e || (a = d.B(k, f, b, c), e = e || a.stop, f = a.Ra, k = a.value);return f + k;
      });f && (a = this.u(a));return a;
    };t.prototype.B = function (a, b, c, d) {
      var e = a.indexOf(jb);0 <= a.indexOf(ib) ? a = this.F(a, d) : 0 !== e && (a = c ? this.o(a, c) : a);c = !1;0 <= e && (b = "", c = !0);if (c) {
        var f = !0;c && (a = a.replace(Yd, function (a, b) {
          return " > " + b;
        }));
      }a = a.replace(Zd, function (a, b, c) {
        return '[dir="' + c + '"] ' + b + ", " + b + '[dir="' + c + '"]';
      });return { value: a, Ra: b, stop: f };
    };t.prototype.o = function (a, b) {
      a = a.split(Lc);a[0] += b;return a.join(Lc);
    };t.prototype.F = function (a, b) {
      var c = a.match(Mc);return (c = c && c[2].trim() || "") ? c[0].match(Nc) ? a.replace(Mc, function (a, c, f) {
        return b + f;
      }) : c.split(Nc)[0] === b ? c : $d : a.replace(ib, b);
    };t.prototype.M = function (a) {
      a.selector = a.parsedSelector;this.w(a);this.l(a, this.I);
    };t.prototype.w = function (a) {
      a.selector === ae && (a.selector = "html");
    };t.prototype.I = function (a) {
      return a.match(jb) ? this.g(a, Oc) : this.o(a.trim(), Oc);
    };
    mb.Object.defineProperties(t.prototype, { a: { configurable: !0, enumerable: !0, get: function () {
          return "style-scope";
        } } });var hb = /:(nth[-\w]+)\(([^)]+)\)/,
        Oc = ":not(.style-scope)",
        Kc = ",",
        Xd = /(^|[\s>+~]+)((?:\[.+?\]|[^\s>+~=[])+)/g,
        Nc = /[[.:#*]/,
        ib = ":host",
        ae = ":root",
        jb = "::slotted",
        Wd = new RegExp("^(" + jb + ")"),
        Mc = /(:host)(?:\(((?:\([^)(]*\)|[^)(]*)+?)\))/,
        Yd = /(?:::slotted)(?:\(((?:\([^)(]*\)|[^)(]*)+?)\))/,
        Zd = /(.*):dir\((?:(ltr|rtl))\)/,
        Vd = ".",
        Lc = ":",
        Ud = "class",
        $d = "should_not_match",
        u = new t();v.get = function (a) {
      return a ? a.__styleInfo : null;
    };v.set = function (a, b) {
      return a.__styleInfo = b;
    };v.prototype.c = function () {
      return this.D;
    };v.prototype._getStyleRules = v.prototype.c;var Pc = function (a) {
      return a.matches || a.matchesSelector || a.mozMatchesSelector || a.msMatchesSelector || a.oMatchesSelector || a.webkitMatchesSelector;
    }(window.Element.prototype),
        be = navigator.userAgent.match("Trident");p.prototype.M = function (a) {
      var b = this,
          c = {},
          d = [],
          e = 0;U(a, function (a) {
        b.c(a);a.index = e++;b.G(a.s.cssText, c);
      }, function (a) {
        d.push(a);
      });a.b = d;a = [];for (var f in c) a.push(f);
      return a;
    };p.prototype.c = function (a) {
      if (!a.s) {
        var b = {},
            c = {};this.b(a, c) && (b.C = c, a.rules = null);b.cssText = this.F(a);a.s = b;
      }
    };p.prototype.b = function (a, b) {
      var c = a.s;if (c) {
        if (c.C) return Object.assign(b, c.C), !0;
      } else {
        c = a.parsedCssText;for (var d; a = ra.exec(c);) {
          d = (a[2] || a[3]).trim();if ("inherit" !== d || "unset" !== d) b[a[1].trim()] = d;d = !0;
        }return d;
      }
    };p.prototype.F = function (a) {
      return this.I(a.parsedCssText);
    };p.prototype.I = function (a) {
      return a.replace(Td, "").replace(ra, "");
    };p.prototype.G = function (a, b) {
      for (var c; c = Rd.exec(a);) {
        var d = c[1];":" !== c[2] && (b[d] = !0);
      }
    };p.prototype.$ = function (a) {
      for (var b = Object.getOwnPropertyNames(a), c = 0, d; c < b.length; c++) d = b[c], a[d] = this.a(a[d], a);
    };p.prototype.a = function (a, b) {
      if (a) if (0 <= a.indexOf(";")) a = this.f(a, b);else {
        var c = this;a = Bc(a, function (a, e, f, h) {
          if (!e) return a + h;(e = c.a(b[e], b)) && "initial" !== e ? "apply-shim-inherit" === e && (e = "inherit") : e = c.a(b[f] || f, b) || f;return a + (e || "") + h;
        });
      }return a && a.trim() || "";
    };p.prototype.f = function (a, b) {
      a = a.split(";");for (var c = 0, d, e; c < a.length; c++) if (d = a[c]) {
        sa.lastIndex = 0;if (e = sa.exec(d)) d = this.a(b[e[1]], b);else if (e = d.indexOf(":"), -1 !== e) {
          var f = d.substring(e);f = f.trim();f = this.a(f, b) || f;d = d.substring(0, e) + f;
        }a[c] = d && d.lastIndexOf(";") === d.length - 1 ? d.slice(0, -1) : d || "";
      }return a.join(";");
    };p.prototype.B = function (a, b) {
      var c = "";a.s || this.c(a);a.s.cssText && (c = this.f(a.s.cssText, b));a.cssText = c;
    };p.prototype.w = function (a, b) {
      var c = a.cssText,
          d = a.cssText;null == a.ua && (a.ua = Sd.test(c));if (a.ua) if (null == a.X) {
        a.X = [];for (var e in b) d = b[e], d = d(c), c !== d && (c = d, a.X.push(e));
      } else {
        for (e = 0; e < a.X.length; ++e) d = b[a.X[e]], c = d(c);d = c;
      }a.cssText = d;
    };p.prototype.Z = function (a, b) {
      var c = {},
          d = this,
          e = [];U(a, function (a) {
        a.s || d.c(a);var f = a.v || a.parsedSelector;b && a.s.C && f && Pc.call(b, f) && (d.b(a, c), a = a.index, f = parseInt(a / 32, 10), e[f] = (e[f] || 0) | 1 << a % 32);
      }, null, !0);return { C: c, key: e };
    };p.prototype.ba = function (a, b, c, d) {
      b.s || this.c(b);if (b.s.C) {
        var e = P(a);a = e.is;e = e.U;e = a ? u.f(a, e) : "html";var f = b.parsedSelector,
            h = ":host > *" === f || "html" === f,
            g = 0 === f.indexOf(":host") && !h;"shady" === c && (h = f === e + " > *." + e || -1 !== f.indexOf("html"), g = !h && 0 === f.indexOf(e));"shadow" === c && (h = ":host > *" === f || "html" === f, g = g && !h);if (h || g) c = e, g && (w && !b.v && (b.v = u.m(b, u.g, u.i(a), e)), c = b.v || e), d({ ab: c, Va: g, jb: h });
      }
    };p.prototype.N = function (a, b) {
      var c = {},
          d = {},
          e = this,
          f = b && b.__cssBuild;U(b, function (b) {
        e.ba(a, b, f, function (f) {
          Pc.call(a.ib || a, f.ab) && (f.Va ? e.b(b, c) : e.b(b, d));
        });
      }, null, !0);return { Za: d, Ua: c };
    };p.prototype.aa = function (a, b, c) {
      var d = this,
          e = P(a),
          f = u.f(e.is, e.U),
          h = new RegExp("(?:^|[^.#[:])" + (a.extends ? "\\" + f.slice(0, -1) + "\\]" : f) + "($|[.:[\\s>+~])");
      e = v.get(a).D;var g = this.h(e, c);return u.c(a, e, function (a) {
        d.B(a, b);w || zc(a) || !a.cssText || (d.w(a, g), d.l(a, h, f, c));
      });
    };p.prototype.h = function (a, b) {
      a = a.b;var c = {};if (!w && a) for (var d = 0, e = a[d]; d < a.length; e = a[++d]) this.j(e, b), c[e.keyframesName] = this.i(e);return c;
    };p.prototype.i = function (a) {
      return function (b) {
        return b.replace(a.f, a.a);
      };
    };p.prototype.j = function (a, b) {
      a.f = new RegExp(a.keyframesName, "g");a.a = a.keyframesName + "-" + b;a.v = a.v || a.selector;a.selector = a.v.replace(a.keyframesName, a.a);
    };p.prototype.l = function (a, b, c, d) {
      a.v = a.v || a.selector;d = "." + d;for (var e = a.v.split(","), f = 0, h = e.length, g; f < h && (g = e[f]); f++) e[f] = g.match(b) ? g.replace(c, d) : d + " " + g;a.selector = e.join(",");
    };p.prototype.o = function (a, b, c) {
      var d = a.getAttribute("class") || "",
          e = d;c && (e = d.replace(new RegExp("\\s*x-scope\\s*" + c + "\\s*", "g"), " "));e += (e ? " " : "") + "x-scope " + b;d !== e && na(a, e);
    };p.prototype.u = function (a, b, c, d) {
      b = d ? d.textContent || "" : this.aa(a, b, c);var e = v.get(a),
          f = e.a;f && !w && f !== d && (f._useCount--, 0 >= f._useCount && f.parentNode && f.parentNode.removeChild(f));
      w ? e.a ? (e.a.textContent = b, d = e.a) : b && (d = Za(b, c, a.shadowRoot, e.b)) : d ? d.parentNode || (be && -1 < b.indexOf("@media") && (d.textContent = b), Ac(d, null, e.b)) : b && (d = Za(b, c, null, e.b));d && (d._useCount = d._useCount || 0, e.a != d && d._useCount++, e.a = d);return d;
    };p.prototype.m = function (a, b) {
      var c = ma(a),
          d = this;a.textContent = T(c, function (a) {
        var c = a.cssText = a.parsedCssText;a.s && a.s.cssText && (c = c.replace(F.sa, "").replace(F.wa, ""), a.cssText = d.f(c, b));
      });
    };mb.Object.defineProperties(p.prototype, { g: { configurable: !0, enumerable: !0, get: function () {
          return "x-scope";
        } } });
    var L = new p(),
        kb = {},
        ta = window.customElements;if (ta && !w) {
      var ce = ta.define;ta.define = function (a, b, c) {
        var d = document.createComment(" Shady DOM styles for " + a + " "),
            e = document.head;e.insertBefore(d, (O ? O.nextSibling : null) || e.firstChild);O = d;kb[a] = d;return ce.call(ta, a, b, c);
      };
    }da.prototype.a = function (a, b, c) {
      for (var d = 0; d < c.length; d++) {
        var e = c[d];if (a.C[e] !== b[e]) return !1;
      }return !0;
    };da.prototype.b = function (a, b, c, d) {
      var e = this.cache[a] || [];e.push({ C: b, styleElement: c, A: d });e.length > this.c && e.shift();this.cache[a] = e;
    };da.prototype.fetch = function (a, b, c) {
      if (a = this.cache[a]) for (var d = a.length - 1; 0 <= d; d--) {
        var e = a[d];if (this.a(e, b, c)) return e;
      }
    };if (!w) {
      var Qc = new MutationObserver(Cc),
          Rc = function (a) {
        Qc.observe(a, { childList: !0, subtree: !0 });
      };if (window.customElements && !window.customElements.polyfillWrapFlushCallback) Rc(document);else {
        var lb = function () {
          Rc(document.body);
        };window.HTMLImports ? window.HTMLImports.whenReady(lb) : requestAnimationFrame(function () {
          if ("loading" === document.readyState) {
            var a = function () {
              lb();document.removeEventListener("readystatechange", a);
            };document.addEventListener("readystatechange", a);
          } else lb();
        });
      }ob = function () {
        Cc(Qc.takeRecords());
      };
    }var oa = {},
        Gd = Promise.resolve(),
        $a = null,
        Ec = window.HTMLImports && window.HTMLImports.whenReady || null,
        ab,
        ua = null,
        ca = null;E.prototype.ta = function () {
      !this.enqueued && ca && (this.enqueued = !0, nb(ca));
    };E.prototype.b = function (a) {
      a.__seenByShadyCSS || (a.__seenByShadyCSS = !0, this.customStyles.push(a), this.ta());
    };E.prototype.a = function (a) {
      return a.__shadyCSSCachedStyle ? a.__shadyCSSCachedStyle : a.getStyle ? a.getStyle() : a;
    };E.prototype.c = function () {
      for (var a = this.customStyles, b = 0; b < a.length; b++) {
        var c = a[b];if (!c.__shadyCSSCachedStyle) {
          var d = this.a(c);d && (d = d.__appliedElement || d, ua && ua(d), c.__shadyCSSCachedStyle = d);
        }
      }return a;
    };E.prototype.addCustomStyle = E.prototype.b;E.prototype.getStyleForCustomStyle = E.prototype.a;E.prototype.processStyles = E.prototype.c;Object.defineProperties(E.prototype, { transformCallback: { get: function () {
          return ua;
        }, set: function (a) {
          ua = a;
        } }, validateCallback: { get: function () {
          return ca;
        }, set: function (a) {
          var b = !1;ca || (b = !0);ca = a;b && this.ta();
        } } });var Sc = new da();k.prototype.w = function () {
      ob();
    };k.prototype.N = function (a) {
      var b = this.m[a] = (this.m[a] || 0) + 1;return a + "-" + b;
    };k.prototype.Ca = function (a) {
      return ma(a);
    };k.prototype.Ea = function (a) {
      return T(a);
    };k.prototype.M = function (a) {
      a = a.content.querySelectorAll("style");for (var b = [], c = 0; c < a.length; c++) {
        var d = a[c];b.push(d.textContent);d.parentNode.removeChild(d);
      }return b.join("").trim();
    };k.prototype.$ = function (a) {
      return (a = a.content.querySelector("style")) ? a.getAttribute("css-build") || "" : "";
    };k.prototype.prepareTemplate = function (a, b, c) {
      if (!a.f) {
        a.f = !0;a.name = b;a.extends = c;oa[b] = a;var d = this.$(a),
            e = this.M(a);c = { is: b, extends: c, fb: d };w || u.b(a.content, b);this.c();var f = sa.test(e) || ra.test(e);sa.lastIndex = 0;ra.lastIndex = 0;e = Ya(e);f && z && this.a && this.a.transformRules(e, b);a._styleAst = e;a.g = d;d = [];z || (d = L.M(a._styleAst));if (!d.length || z) b = this.Z(c, a._styleAst, w ? a.content : null, kb[b]), a.a = b;a.c = d;
      }
    };k.prototype.Z = function (a, b, c, d) {
      b = u.c(a, b);if (b.length) return Za(b, a.is, c, d);
    };k.prototype.ba = function (a) {
      var b = P(a),
          c = b.is;b = b.U;var d = kb[c];c = oa[c];if (c) {
        var e = c._styleAst;var f = c.c;
      }return v.set(a, new v(e, d, f, 0, b));
    };k.prototype.F = function () {
      !this.a && window.ShadyCSS && window.ShadyCSS.ApplyShim && (this.a = window.ShadyCSS.ApplyShim, this.a.invalidCallback = Ed);
    };k.prototype.G = function () {
      var a = this;!this.b && window.ShadyCSS && window.ShadyCSS.CustomStyleInterface && (this.b = window.ShadyCSS.CustomStyleInterface, this.b.transformCallback = function (b) {
        a.u(b);
      }, this.b.validateCallback = function () {
        requestAnimationFrame(function () {
          (a.b.enqueued || a.i) && a.f();
        });
      });
    };k.prototype.c = function () {
      this.F();this.G();
    };k.prototype.f = function () {
      this.c();if (this.b) {
        var a = this.b.processStyles();this.b.enqueued && (z ? this.Aa(a) : (this.o(this.g, this.h), this.B(a)), this.b.enqueued = !1, this.i && !z && this.styleDocument());
      }
    };k.prototype.styleElement = function (a, b) {
      var c = P(a).is,
          d = v.get(a);d || (d = this.ba(a));this.j(a) || (this.i = !0);b && (d.L = d.L || {}, Object.assign(d.L, b));if (z) {
        if (d.L) {
          b = d.L;for (var e in b) null === e ? a.style.removeProperty(e) : a.style.setProperty(e, b[e]);
        }if (((e = oa[c]) || this.j(a)) && e && e.a && !Dc(e)) {
          if (Dc(e) || e._applyShimValidatingVersion !== e._applyShimNextVersion) this.c(), this.a && this.a.transformRules(e._styleAst, c), e.a.textContent = u.c(a, d.D), Fd(e);w && (c = a.shadowRoot) && (c.querySelector("style").textContent = u.c(a, d.D));d.D = e._styleAst;
        }
      } else this.o(a, d), d.ja && d.ja.length && this.I(a, d);
    };k.prototype.l = function (a) {
      return (a = a.getRootNode().host) ? v.get(a) ? a : this.l(a) : this.g;
    };k.prototype.j = function (a) {
      return a === this.g;
    };k.prototype.I = function (a, b) {
      var c = P(a).is,
          d = Sc.fetch(c, b.H, b.ja),
          e = d ? d.styleElement : null,
          f = b.A;b.A = d && d.A || this.N(c);e = L.u(a, b.H, b.A, e);w || L.o(a, b.A, f);d || Sc.b(c, b.H, e, b.A);
    };k.prototype.o = function (a, b) {
      var c = this.l(a),
          d = v.get(c);c = Object.create(d.H || null);var e = L.N(a, b.D);a = L.Z(d.D, a).C;Object.assign(c, e.Ua, a, e.Za);this.aa(c, b.L);L.$(c);b.H = c;
    };k.prototype.aa = function (a, b) {
      for (var c in b) {
        var d = b[c];if (d || 0 === d) a[c] = d;
      }
    };k.prototype.styleDocument = function (a) {
      this.styleSubtree(this.g, a);
    };k.prototype.styleSubtree = function (a, b) {
      var c = a.shadowRoot;
      (c || this.j(a)) && this.styleElement(a, b);if (b = c && (c.children || c.childNodes)) for (a = 0; a < b.length; a++) this.styleSubtree(b[a]);else if (a = a.children || a.childNodes) for (b = 0; b < a.length; b++) this.styleSubtree(a[b]);
    };k.prototype.Aa = function (a) {
      for (var b = 0; b < a.length; b++) {
        var c = this.b.getStyleForCustomStyle(a[b]);c && this.za(c);
      }
    };k.prototype.B = function (a) {
      for (var b = 0; b < a.length; b++) {
        var c = this.b.getStyleForCustomStyle(a[b]);c && L.m(c, this.h.H);
      }
    };k.prototype.u = function (a) {
      var b = this,
          c = ma(a);U(c, function (a) {
        w ? u.w(a) : u.M(a);z && (b.c(), b.a && b.a.transformRule(a));
      });z ? a.textContent = T(c) : this.h.D.rules.push(c);
    };k.prototype.za = function (a) {
      if (z && this.a) {
        var b = ma(a);this.c();this.a.transformRules(b);a.textContent = T(b);
      }
    };k.prototype.getComputedStyleValue = function (a, b) {
      var c;z || (c = (v.get(a) || v.get(this.l(a))).H[b]);return (c = c || window.getComputedStyle(a).getPropertyValue(b)) ? c.trim() : "";
    };k.prototype.Da = function (a, b) {
      var c = a.getRootNode();b = b ? b.split(/\s/) : [];c = c.host && c.host.localName;if (!c) {
        var d = a.getAttribute("class");
        if (d) {
          d = d.split(/\s/);for (var e = 0; e < d.length; e++) if (d[e] === u.a) {
            c = d[e + 1];break;
          }
        }
      }c && b.push(u.a, c);z || (c = v.get(a)) && c.A && b.push(L.g, c.A);na(a, b.join(" "));
    };k.prototype.Ba = function (a) {
      return v.get(a);
    };k.prototype.flush = k.prototype.w;k.prototype.prepareTemplate = k.prototype.prepareTemplate;k.prototype.styleElement = k.prototype.styleElement;k.prototype.styleDocument = k.prototype.styleDocument;k.prototype.styleSubtree = k.prototype.styleSubtree;k.prototype.getComputedStyleValue = k.prototype.getComputedStyleValue;
    k.prototype.setElementClass = k.prototype.Da;k.prototype._styleInfoForNode = k.prototype.Ba;k.prototype.transformCustomStyleForDocument = k.prototype.u;k.prototype.getStyleAst = k.prototype.Ca;k.prototype.styleAstToString = k.prototype.Ea;k.prototype.flushCustomStyles = k.prototype.f;Object.defineProperties(k.prototype, { nativeShadow: { get: function () {
          return w;
        } }, nativeCss: { get: function () {
          return z;
        } } });var H = new k();if (window.ShadyCSS) {
      var Tc = window.ShadyCSS.ApplyShim;var Uc = window.ShadyCSS.CustomStyleInterface;
    }window.ShadyCSS = { ScopingShim: H, prepareTemplate: function (a, b, c) {
        H.f();H.prepareTemplate(a, b, c);
      }, styleSubtree: function (a, b) {
        H.f();H.styleSubtree(a, b);
      }, styleElement: function (a) {
        H.f();H.styleElement(a);
      }, styleDocument: function (a) {
        H.f();H.styleDocument(a);
      }, getComputedStyleValue: function (a, b) {
        return H.getComputedStyleValue(a, b);
      }, nativeCss: z, nativeShadow: w };Tc && (window.ShadyCSS.ApplyShim = Tc);Uc && (window.ShadyCSS.CustomStyleInterface = Uc);var bb = window.document;window.WebComponents = window.WebComponents || {};"loading" !== bb.readyState ? Fc() : bb.addEventListener("readystatechange", Gc);
  })();
}).call(this);

//# sourceMappingURL=webcomponents-sd-ce.js.map
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__("./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/css-loader/index.js!./node_modules/stylus-loader/index.js!./src/components/example/example.styl":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("./node_modules/css-loader/lib/css-base.js")(undefined);
// imports


// module
exports.push([module.i, ":host {\n  display: block;\n  margin: 10px;\n}\ndiv {\n  height: 30px;\n  background-color: var(--color, #808080);\n}\n", ""]);

// exports


/***/ }),

/***/ "./node_modules/css-loader/lib/css-base.js":
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function (useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if (item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function (modules, mediaQuery) {
		if (typeof modules === "string") modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for (var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if (typeof id === "number") alreadyImportedModules[id] = true;
		}
		for (i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if (typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if (mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if (mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */';
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}

/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = function () {
	return this;
}();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1, eval)("this");
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;

/***/ }),

/***/ "./node_modules/webpack/buildin/module.js":
/***/ (function(module, exports) {

module.exports = function (module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function () {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function () {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function () {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};

/***/ }),

/***/ "./src/components/example/example.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_component__ = __webpack_require__("../../src/component.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__src_utilities__ = __webpack_require__("../../src/utilities.js");





const exampleDefinition = {
  properties: {
    isVisible: ({ element }) => ({
      configurable: true,
      get() {
        console.log('get isVisible()');
        return element.hasAttribute('visible');
      },
      set(newValue) {
        console.log('set isVisible()', newValue);

        if (!newValue) element.removeAttribute('visible');else element.setAttribute('visible', newValue);
      }
    }),
    color: ({ element }) => ({
      configurable: true,
      get() {
        console.log('get color()');
        return element.getAttribute('color');
      },
      set(newValue) {
        console.log('set color()', newValue);

        if (!newValue) element.removeAttribute('color');else element.setAttribute('color', newValue);
      }
    })
  },
  attributes: {
    visible: ({ element, render }, value, oldValue) => {

      console.error('[visible] changed', oldValue, '=>', value);

      //element.isVisible = value === '';
      render();
    },
    color: ({ element, render }, value, oldValue) => {

      console.error('[color] changed', value);
      //element.color = value
      render();
    }
  },
  hooks: {
    create: Object(__WEBPACK_IMPORTED_MODULE_1__src_utilities__["b" /* decorate */])(__WEBPACK_IMPORTED_MODULE_0__src_component__["a" /* default */], (next, component) => {

      component = next(component);

      const { element } = component;

      //console.log('create', Object.getOwnPropertyDescriptor(element, 'isVisible'))

      element.attachShadow({ mode: 'open' });

      console.log('shadowRoot', element.children.length, element.shadowRoot);

      return component;
    }),
    render: ({ element, properties }) => {

      let variables = ':host {';

      if (element.color) variables += `--color: ${element.color};`;

      variables += '}';

      let content = `
        <style>${variables}\n${exampleDefinition.style}</style>
        <div>${properties.isVisible ? 'visible' : ''}</div>
      `;

      element.shadowRoot.innerHTML = content;
    }
  }
};

/* harmony default export */ __webpack_exports__["a"] = (exampleDefinition);

/***/ }),

/***/ "./src/components/example/example.styl":
/***/ (function(module, exports, __webpack_require__) {


        var result = __webpack_require__("./node_modules/css-loader/index.js!./node_modules/stylus-loader/index.js!./src/components/example/example.styl");

        if (typeof result === "string") {
            module.exports = result;
        } else {
            module.exports = result.toString();
        }
    

/***/ }),

/***/ "./src/components/example/index.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src__ = __webpack_require__("../../src/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__example__ = __webpack_require__("./src/components/example/example.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__example_styl__ = __webpack_require__("./src/components/example/example.styl");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__example_styl___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__example_styl__);






/* unused harmony default export */ var _unused_webpack_default_export = (Object(__WEBPACK_IMPORTED_MODULE_0__src__["a" /* defineComponent */])(Object.assign(__WEBPACK_IMPORTED_MODULE_1__example__["a" /* default */], {
  tagName: 'example',
  style: __WEBPACK_IMPORTED_MODULE_2__example_styl___default.a,
  verbose: true
})));

/***/ }),

/***/ "./src/index.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__webcomponents_webcomponentsjs_webcomponents_sd_ce__ = __webpack_require__("./node_modules/@webcomponents/webcomponentsjs/webcomponents-sd-ce.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__webcomponents_webcomponentsjs_webcomponents_sd_ce___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__webcomponents_webcomponentsjs_webcomponents_sd_ce__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_example__ = __webpack_require__("./src/components/example/index.js");






const createElement = document.createElement.bind(document);
const appendChild = document.body.appendChild.bind(document.body);

const createButton = text => {
  const button = document.createElement('button');
  button.innerText = text;
  return button;
};

document.addEventListener('DOMContentLoaded', () => {

  const examples = document.getElementById('examples');
  const example = document.querySelector('x-example');

  const colorButton = examples.insertBefore(createButton('color'), examples.firstChild);
  const visibleButton = examples.insertBefore(createButton('visible'), examples.firstChild);

  const refreshColorButtonText = () => colorButton.innerText = `color:${example.color}`;
  const refreshVisibleButtonText = () => visibleButton.innerText = `visible:${example.isVisible.toString()}`;

  refreshVisibleButtonText();
  refreshColorButtonText();

  colorButton.onclick = () => {
    example.color = 'blue';
    refreshColorButtonText();
  };

  visibleButton.onclick = () => {
    const isVisible = example.isVisible = !example.isVisible;
    refreshVisibleButtonText();
  };

  const anotherExample = createElement('x-example');
  anotherExample.setAttribute('visible', '');
  anotherExample.setAttribute('color', '#bada55');

  //<x-example id="d" visible color="#bada55"></x-example>
  appendChild(anotherExample);

  document.getElementById('toggle').addEventListener('click', () => {
    example.isVisible = !example.isVisible;
  });
  document.getElementById('attach').addEventListener('click', () => {
    examples.insertBefore(example, examples.firstChild);
  });
  document.getElementById('detach').addEventListener('click', () => {
    examples.removeChild(example);
  });
});

/***/ })

/******/ });
//# sourceMappingURL=main.js.map