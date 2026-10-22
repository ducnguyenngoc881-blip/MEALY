import UIKit
import Capacitor
import AppTrackingTransparency
import AdSupport

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = CAPBridgeViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func sceneDidBecomeActive(_ scene: UIScene) {
        requestTrackingIfNeeded(delay: 1.0)
        requestTrackingIfNeeded(delay: 2.5)
    }

    private func requestTrackingIfNeeded(delay: TimeInterval) {
        DispatchQueue.main.asyncAfter(deadline: .now() + delay) { [weak self] in
            if #available(iOS 14.5, *) {
                ATTrackingManager.requestTrackingAuthorization { status in
                    let statusString: String
                    switch status {
                    case .authorized:
                        statusString = "authorized"
                    case .denied:
                        statusString = "denied"
                    case .restricted:
                        statusString = "restricted"
                    case .notDetermined:
                        statusString = "not_determined"
                    @unknown default:
                        statusString = "denied"
                    }
                    DispatchQueue.main.async {
                        if let bridgeVC = self?.window?.rootViewController as? CAPBridgeViewController,
                           let webView = bridgeVC.webView {
                            let js = "try { localStorage.setItem('mealwise_mmp_att_status_v1', '\(statusString)'); window.dispatchEvent(new CustomEvent('mealwise:att_status_changed', { detail: { status: '\(statusString)' } })); } catch(e) {}"
                            webView.evaluateJavaScript(js, completionHandler: nil)
                        }
                    }
                }
            }
        }
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
