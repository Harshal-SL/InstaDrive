package com.alphaweb.instadrive.service;

import com.alphaweb.instadrive.model.Car;
import com.alphaweb.instadrive.repository.CarRepository;
import lombok.RequiredArgsConstructor;
// Removed unused cache annotations
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CarService {
    private final CarRepository carRepository;

    public List<Car> getAllCars() {
        return carRepository.findAll();
    }

    public Optional<Car> getCarById(Long id) {
        return carRepository.findById(id);
    }

    public Car addCar(Car car) {
        return carRepository.save(car);
    }

    public void deleteCar(Long id) {
        carRepository.deleteById(id);
    }

    public Car updateCar(Long id, Car carDetails) {
        Optional<Car> carOptional = carRepository.findById(id);
        if (carOptional.isPresent()) {
            Car car = carOptional.get();
            car.setBrand(carDetails.getBrand());
            car.setModel(carDetails.getModel());
            car.setFuelType(carDetails.getFuelType());
            car.setRegistrationNumber(carDetails.getRegistrationNumber());
            car.setPricePerDay(carDetails.getPricePerDay());
            car.setTransmission(carDetails.getTransmission());
            car.setColor(carDetails.getColor());
            car.setYear(carDetails.getYear());
            car.setDescription(carDetails.getDescription());
            car.setImageUrl(carDetails.getImageUrl());

            // Update car features
            car.setAirConditioning(carDetails.isAirConditioning());
            car.setBluetooth(carDetails.isBluetooth());
            car.setGpsNavigation(carDetails.isGpsNavigation());
            car.setLeatherSeats(carDetails.isLeatherSeats());
            car.setSunroof(carDetails.isSunroof());
            car.setBackupCamera(carDetails.isBackupCamera());
            car.setParkingSensors(carDetails.isParkingSensors());
            car.setKeylessEntry(carDetails.isKeylessEntry());
            car.setHeatedSeats(carDetails.isHeatedSeats());
            car.setAppleCarPlay(carDetails.isAppleCarPlay());
            car.setAndroidAuto(carDetails.isAndroidAuto());

            return carRepository.save(car);
        }
        return null; // Or handle with custom exception
    }

}
