"""Ports the application layer depends on; implemented by the infrastructure layer.

Defining these as `Protocol`s (structural typing) means infrastructure
adapters do not need to import — or depend on — the application layer at
all, keeping the dependency arrow pointing inward as Clean Architecture
requires.
"""
