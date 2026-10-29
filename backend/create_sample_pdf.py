import os
import pymupdf

def create_sample_sid():
    os.makedirs("sample_data", exist_ok=True)
    doc = pymupdf.open()
    
    # Page 1: Key Scheme Info & Riskometer
    p1 = doc.new_page()
    text_p1 = (
        "SCHEME INFORMATION DOCUMENT (SID)\n"
        "AXIS BLUECHIP FUND (An Open-Ended Equity Scheme)\n\n"
        "1. HIGHLIGHTS & SUMMARY OF THE SCHEME\n"
        "Investment Objective: To achieve long-term capital appreciation by investing predominantly in equity and equity related securities of large cap companies.\n"
        "Asset Allocation Pattern:\n"
        "- Equity and Equity related instruments of Large Cap companies: 80% to 100% (Risk Profile: Very High)\n"
        "- Debt and Money Market Instruments: 0% to 20% (Risk Profile: Low to Moderate)\n\n"
        "Riskometer Classification: VERY HIGH RISK.\n"
        "Investors understand that their principal will be at very high risk.\n"
        "Benchmark: NIFTY 50 TRI (Total Returns Index).\n"
        "Minimum Application Amount: Rs. 500 and in multiples of Re. 1 thereafter for SIP purchases.\n"
    )
    p1.insert_text((50, 60), text_p1, fontsize=11)

    # Page 2: Fees, Expenses & Exit Load
    p2 = doc.new_page()
    text_p2 = (
        "AXIS BLUECHIP FUND - SCHEME INFORMATION DOCUMENT\n\n"
        "2. FEES AND EXPENSES OF THE SCHEME\n"
        "A. Total Expense Ratio (TER):\n"
        "- Regular Plan TER: Maximum 1.75% per annum.\n"
        "- Direct Plan TER: Approximately 0.65% per annum.\n"
        "Expenses are charged within the limits specified under SEBI (Mutual Funds) Regulations, 1996 Regulation 52.\n\n"
        "B. Load Structure:\n"
        "- Entry Load: NIL. (In terms of SEBI circular no. SEBI/IMD/CIR No. 4/168230/09 dated June 30, 2009, no entry load is charged).\n"
        "- Exit Load: If redeemed/switched-out within 12 months from the date of allotment: 1.00% for redemption exceeding 10% of investment.\n"
        "- Exit Load after 12 months: NIL.\n\n"
        "3. LIQUIDITY PROVISIONS\n"
        "Units may be redeemed on all business days at NAV based prices. Dispatch of redemption proceeds is processed within 3 business days under standard banking turnaround.\n"
    )
    p2.insert_text((50, 60), text_p2, fontsize=11)

    # Page 3: Principal Risk Factors & SEBI Suitability Notes
    p3 = doc.new_page()
    text_p3 = (
        "AXIS BLUECHIP FUND - SCHEME INFORMATION DOCUMENT\n\n"
        "4. PRINCIPAL RISK FACTORS & SUITABILITY WARNINGS\n"
        "- Standard Risk: Mutual fund investments are subject to market risks, read all scheme related documents carefully.\n"
        "- Equity Risk: The scheme invests in equities which are volatile and prone to capital drawdowns during market corrections.\n"
        "- Time Horizon Suitability: This scheme is strictly suitable for investors with a long-term investment horizon of 5 years or more. It is UNSUITABLE for clients with liquidity needs under 3 years.\n"
        "- Derivatives Risk: The scheme may invest in derivatives for hedging and portfolio rebalancing purposes within SEBI regulatory limits.\n"
        "- Fiduciary Guidance for SEBI Registered Investment Advisers: Advisers must verify that the investor has an adequate emergency buffer and capacity to tolerate drawdowns before recommending this high-beta equity product.\n"
    )
    p3.insert_text((50, 60), text_p3, fontsize=11)

    doc.save("sample_data/Sample_Axis_Bluechip_SID.pdf")
    doc.close()
    print("Created sample_data/Sample_Axis_Bluechip_SID.pdf")

if __name__ == "__main__":
    create_sample_sid()
