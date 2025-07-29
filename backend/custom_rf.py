import numpy as np
from collections import Counter

# Gini Impurity Function
def gini(y):
    counts = Counter(y)
    impurity = 1 - sum((c / len(y))**2 for c in counts.values())
    return impurity

# Dataset Split
def split_dataset(X, y, feature_index, threshold):
    left_indices = [i for i in range(len(X)) if X[i][feature_index] <= threshold]
    right_indices = [i for i in range(len(X)) if X[i][feature_index] > threshold]
    return (X[left_indices], y[left_indices]), (X[right_indices], y[right_indices])

# Best Split Calculation
def best_split(X, y, features):
    best_gain = 0
    best_feature, best_threshold = None, None
    current_gini = gini(y)

    for feature_idx in features:
        thresholds = np.unique(X[:, feature_idx])
        for t in thresholds:
            (X_left, y_left), (X_right, y_right) = split_dataset(X, y, feature_idx, t)
            
            if len(y_left) == 0 or len(y_right) == 0:
                continue
            
            gain = current_gini - (
                (len(y_left)/len(y)) * gini(y_left) +
                (len(y_right)/len(y)) * gini(y_right)
            )
            
            if gain > best_gain:
                best_gain = gain
                best_feature = feature_idx
                best_threshold = t
    return best_feature, best_threshold

# Tree Node Class
class TreeNode:
    def __init__(self, feature=None, threshold=None, left=None, right=None, *, value=None):
        self.feature = feature
        self.threshold = threshold
        self.left = left
        self.right = right
        self.value = value # Class label for leaf node

    def is_leaf(self):
        return self.value is not None

# Build Decision Tree
def build_tree(X, y, depth=0, max_depth=10, min_samples=5, num_features=None):
    # Stop splitting if conditions are met
    if len(y) == 0:
        # Return a leaf node with a default value (e.g., 0)
        return TreeNode(value=0)
    if len(set(y)) == 1 or len(y) < min_samples or depth >= max_depth:
        # Return leaf node with most common class
        return TreeNode(value=Counter(y).most_common(1)[0][0])

    n_features = X.shape[1]
    # Select a subset of features for Random Forest (feature bagging)
    features_to_consider = np.random.choice(n_features, num_features or n_features, replace=False)
    
    best_feat, best_thresh = best_split(X, y, features_to_consider)

    # If no split improves Gini impurity, make it a leaf node
    if best_feat is None:
        return TreeNode(value=Counter(y).most_common(1)[0][0])

    (X_left, y_left), (X_right, y_right) = split_dataset(X, y, best_feat, best_thresh)
    
    # If either split is empty, return a leaf node with the most common class
    if len(y_left) == 0 or len(y_right) == 0:
        return TreeNode(value=Counter(y).most_common(1)[0][0])

    # Recursively build left and right sub-trees
    left_branch = build_tree(X_left, y_left, depth + 1, max_depth, min_samples, num_features)
    right_branch = build_tree(X_right, y_right, depth + 1, max_depth, min_samples, num_features)

    return TreeNode(feature=best_feat, threshold=best_thresh, left=left_branch, right=right_branch)

# Tree Prediction
def predict_tree(x, tree):
    if tree.is_leaf():
        return tree.value
    
    # Handle potential None for tree.feature (if prediction on data with less features than training)
    if tree.feature is None or tree.feature >= len(x):
        # Fallback to majority class of this node if feature is invalid
        return tree.value if tree.value is not None else 0 # Or raise error
    
    if x[tree.feature] <= tree.threshold:
        return predict_tree(x, tree.left)
    else:
        return predict_tree(x, tree.right)

# Random Forest Class
class RandomForest:
    def __init__(self, n_trees=100, max_depth=10, min_samples=5):
        self.n_trees = n_trees
        self.max_depth = max_depth
        self.min_samples = min_samples
        self.trees = []

    def fit(self, X, y):
        self.trees = []
        n_features_sqrt = int(np.sqrt(X.shape[1])) # Features to consider at each split
        for _ in range(self.n_trees):
            # Bootstrap sampling
            indices = np.random.choice(len(X), len(X), replace=True)
            X_sample = X[indices]
            y_sample = y[indices]
            
            # Build a tree
            tree = build_tree(X_sample, y_sample, max_depth=self.max_depth, 
                              min_samples=self.min_samples, num_features=n_features_sqrt)
            self.trees.append(tree)

    def predict(self, X):
        # Get predictions from all trees
        tree_preds = np.array([[predict_tree(x, tree) for tree in self.trees] for x in X])
        # Majority vote for final prediction
        return [Counter(row).most_common(1)[0][0] for row in tree_preds]
    
    def predict_proba(self, X):
        """
        Predict class probabilities for X.
        Returns a list of arrays where each array contains [prob_class_0, prob_class_1]
        """
        # Get predictions from all trees
        tree_preds = np.array([[predict_tree(x, tree) for tree in self.trees] for x in X])
        
        # Calculate probabilities
        probabilities = []
        for row in tree_preds:
            counts = Counter(row)
            total = len(row)
            # Ensure we have probabilities for both classes (0 and 1)
            prob_0 = counts.get(0, 0) / total
            prob_1 = counts.get(1, 0) / total
            probabilities.append([prob_0, prob_1])
        
        return np.array(probabilities)