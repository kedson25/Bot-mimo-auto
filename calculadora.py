#!/usr/bin/env python3
"""Calculadora simples em Python"""

def soma(a, b):
    return a + b

def subtracao(a, b):
    return a - b

def multiplicacao(a, b):
    return a * b

def divisao(a, b):
    if b == 0:
        return "Erro: divisão por zero"
    return a / b

def calculadora():
    print("Calculadora Simples")
    print("=" * 30)
    
    while True:
        print("\nOperações disponíveis:")
        print("1. Soma (+)")
        print("2. Subtração (-)")
        print("3. Multiplicação (*)")
        print("4. Divisão (/)")
        print("5. Sair")
        
        opcao = input("\nEscolha uma operação (1-5): ")
        
        if opcao == '5':
            print("Saindo da calculadora...")
            break
            
        if opcao not in ['1', '2', '3', '4']:
            print("Opção inválida! Tente novamente.")
            continue
            
        try:
            num1 = float(input("Digite o primeiro número: "))
            num2 = float(input("Digite o segundo número: "))
        except ValueError:
            print("Entrada inválida! Digite números.")
            continue
            
        if opcao == '1':
            resultado = soma(num1, num2)
            operacao = "+"
        elif opcao == '2':
            resultado = subtracao(num1, num2)
            operacao = "-"
        elif opcao == '3':
            resultado = multiplicacao(num1, num2)
            operacao = "*"
        elif opcao == '4':
            resultado = divisao(num1, num2)
            operacao = "/"
            
        print(f"\nResultado: {num1} {operacao} {num2} = {resultado}")

if __name__ == "__main__":
    calculadora()