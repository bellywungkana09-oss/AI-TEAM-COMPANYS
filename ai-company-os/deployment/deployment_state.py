from enum import StrEnum
class DeliveryState(StrEnum): CREATED='created';BUILDING='building';TESTING='testing';READY='ready';DEPLOYED='deployed';FAILED='failed';ROLLED_BACK='rolled_back'
TRANSITIONS={DeliveryState.CREATED:{DeliveryState.BUILDING,DeliveryState.FAILED},DeliveryState.BUILDING:{DeliveryState.TESTING,DeliveryState.FAILED},DeliveryState.TESTING:{DeliveryState.READY,DeliveryState.FAILED},DeliveryState.READY:{DeliveryState.DEPLOYED,DeliveryState.FAILED},DeliveryState.DEPLOYED:{DeliveryState.ROLLED_BACK},DeliveryState.FAILED:{DeliveryState.ROLLED_BACK},DeliveryState.ROLLED_BACK:set()}
