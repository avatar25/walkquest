import SwiftUI

// MARK: - Spacing
public enum Spacing {
    public static let xs: CGFloat = 4
    public static let s: CGFloat = 8
    public static let m: CGFloat = 12
    public static let l: CGFloat = 16
    public static let xl: CGFloat = 24
    public static let xxl: CGFloat = 32
}

// MARK: - Radius
public enum Radius {
    public static let small: CGFloat = 8
    public static let medium: CGFloat = 12
    public static let card: CGFloat = 20
    public static let large: CGFloat = 24
}

// MARK: - Typography
public enum Typography {
    public static let title = Font.system(.title2, design: .rounded).weight(.semibold)
    public static let titleLarge = Font.system(.title, design: .rounded).weight(.bold)
    public static let body = Font.system(.body, design: .rounded)
    public static let caption = Font.system(.caption, design: .rounded)
    public static let button = Font.system(.body, design: .rounded).weight(.medium)
}

// MARK: - Colors
public enum AppColors {
    public static let primary = Color.blue
    public static let secondary = Color.green
    public static let success = Color.green
    public static let warning = Color.orange
    public static let error = Color.red
    public static let background = Color(.systemBackground)
    public static let cardBackground = Color(.secondarySystemBackground)
}
