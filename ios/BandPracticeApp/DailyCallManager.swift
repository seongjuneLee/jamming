import Foundation
import Daily
import React

@objc(DailyCallManager)
class DailyCallManager: NSObject {
    private var callClient: DailyCallClient?
    private var currentRoom: DailyRoom?
    
    @objc
    func initialize(_ apiKey: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        do {
            callClient = try DailyCallClient(apiKey: apiKey)
            resolve(true)
        } catch {
            reject("INIT_ERROR", "Failed to initialize Daily client", error)
        }
    }
    
    @objc
    func joinRoom(_ roomUrl: String, token: String?, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let client = callClient else {
            reject("CLIENT_ERROR", "Daily client not initialized", nil)
            return
        }
        
        let roomConfig = DailyRoomConfig(url: roomUrl, token: token)
        
        client.joinRoom(config: roomConfig) { [weak self] result in
            switch result {
            case .success(let room):
                self?.currentRoom = room
                resolve(true)
            case .failure(let error):
                reject("JOIN_ERROR", "Failed to join room", error)
            }
        }
    }
    
    @objc
    func leaveRoom(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let room = currentRoom else {
            resolve(true)
            return
        }
        
        room.leave { result in
            switch result {
            case .success:
                self.currentRoom = nil
                resolve(true)
            case .failure(let error):
                reject("LEAVE_ERROR", "Failed to leave room", error)
            }
        }
    }
    
    @objc
    func setAudioEnabled(_ enabled: Bool, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let room = currentRoom else {
            reject("ROOM_ERROR", "No active room", nil)
            return
        }
        
        room.setAudioEnabled(enabled) { result in
            switch result {
            case .success:
                resolve(true)
            case .failure(let error):
                reject("AUDIO_ERROR", "Failed to set audio state", error)
            }
        }
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
}

// MARK: - React Native Module Registration
@objc(DailyCallManagerModule)
class DailyCallManagerModule: NSObject {
    @objc
    static func register() {
        let manager = DailyCallManager()
        let bridge = RCTBridge.current()
        bridge?.moduleRegistry.register(manager, withName: "DailyCallManager")
    }
} 