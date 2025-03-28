######
# imports
######
# general
import statistics
import datetime

# from sklearn.externals import joblib # save and load models
import joblib
import random

# data manipulation and exploration
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
import statsmodels.api as sm
import math

## machine learning stuff
# preprocessing
from sklearn import preprocessing

# feature selection
from sklearn.feature_selection import SelectKBest, SelectPercentile
from sklearn.feature_selection import f_regression

# pipeline
from sklearn.pipeline import Pipeline

# train/testing
from sklearn.model_selection import (
    train_test_split,
    KFold,
    GridSearchCV,
    cross_val_score,
)
from sktime.utils.plotting import plot_series

# error calculations
from sklearn.metrics import (
    mean_squared_error,
    mean_absolute_error,
    r2_score,
    accuracy_score,
    f1_score,
    matthews_corrcoef,
)
from sktime.performance_metrics.forecasting import (
    MeanSquaredError,
    MeanAbsoluteError,
    MeanAbsolutePercentageError,
)

# models
from sklearn.linear_model import LinearRegression  # linear regression
from sklearn.linear_model import BayesianRidge  # bayesisan ridge regression
from sklearn.svm import SVR  # support vector machines regression
from sklearn.gaussian_process import (
    GaussianProcessRegressor,
)  # import GaussianProcessRegressor
from sklearn.neighbors import KNeighborsRegressor  # k-nearest neightbors for regression
from sklearn.neural_network import MLPRegressor  # neural network for regression
from sklearn.tree import DecisionTreeRegressor  # decision tree regressor
from sklearn.ensemble import RandomForestRegressor  # random forest regression
from sklearn.ensemble import AdaBoostRegressor  # adaboost for regression
import xgboost as xgb

skt_mape = MeanAbsolutePercentageError(symmetric=False)
skt_smape = MeanAbsolutePercentageError(symmetric=True)
skt_mae = MeanAbsoluteError()
skt_mse = MeanSquaredError()
# saving models
# from sklearn.externals import joblib

#######################################
# DATAFRAME FUNCTIONS
#######################################

print("Hello")


def combineLocData(dfList, state, city):
    """
    inputs: dfList- list of tuples - the first element of the tuple is a date object representing the date the crops
                    in the corresponding dataframe were planted. The 2nd element is a dataframe.
            state- string - the name of the state that corresponds with the data in the dataframe
            city- string - name of the city that corresponds with the data in the dataframe
    outputs: a dataframe that is an aggregate of all of the given dataframes.

    NOTE: This function assumes that the dataframes contain a "Variety" column, columns labeled with dates (as strings),
          and any columns representing a "total" amount has a label which is a string and ends with a ")".
    """

    # initialize list of dictionaries

    dictList = []

    for dateSown, df in dfList:
        # get the sownDate
        sownDate = dateSown

        # get the number of columns
        colNumber = df.shape[1]

        # get the column names
        colNames = list(df.columns.values)

        # loop through every row (each row is a series)
        for index, row in df.iterrows():
            # initialize yield list to hold values for valDict
            yieldList = []

            # for every column in this row
            for i in range(colNumber):
                # if it is a column labeled "Variety" column (assumes there is only one "Variety" column)
                if (
                    colNames[i] == "Variety"
                    or colNames == "variety"
                    or colNames[i] == "Variety "
                    or colNames[i] == "variety "
                ):
                    # get the variety value
                    variety = row[i]

                # if it is not a "total" column
                elif colNames[i][-1] != ")":
                    # get the date the crop was harvested
                    yieldDateString = colNames[i]
                    # convert the yield date from a string to a datetime
                    yieldDate = datetime.datetime.strptime(
                        yieldDateString, "%m/%d/%Y"
                    ).date()
                    # get the yield date as an epoch time
                    yieldDateEpoch = datetime.datetime.strptime(
                        yieldDateString, "%m/%d/%Y"
                    ).timestamp()
                    # get the yield
                    cropYield = df.iloc[index, i]

                    yieldTup = (yieldDate, yieldDateEpoch, cropYield)
                    yieldList.append(yieldTup)

            # fill dictionary
            for tup in yieldList:
                # get vals
                yieldDate = tup[0]
                yieldDateEpoch = tup[1]
                cropYield = tup[2]

                # initialize dicitonary
                dataDict = {}

                dataDict["State"] = state
                dataDict["City"] = city
                dataDict["Date Sown"] = sownDate
                dataDict["Variety"] = variety
                dataDict["Date of Cut"] = yieldDate
                dataDict["Date of Cut (Epoch)"] = yieldDateEpoch
                dataDict["Yield (tons/acre)"] = cropYield
                # append dictionary to list of dictionaries
                dictList.append(dataDict)

    # make the final dataframe
    finalDf = pd.DataFrame(dictList)

    # rearrange columns of finalDf
    finalDf = finalDf[
        [
            "State",
            "City",
            "Date Sown",
            "Variety",
            "Date of Cut",
            "Date of Cut (Epoch)",
            "Yield (tons/acre)",
        ]
    ]

    # return result
    return finalDf


def convertToTons(df):
    """
    inputs: df - a dataframe where all values in the table are ints or floats
                 except for one column which could have variety names.
    outputs: a dataframe that is the same as the input except all of the values are converted from
             (lbs/acre) to (tons/acre). (In other words, every values is divided by 2000.0)
    """

    # get the number of columns
    colNumber = df.columns.get_loc(col)
    # get the number of rows
    numRows = len(df.index)

    # for every column in df
    for col in df:
        if col != "Variety":
            # for every row
            for rowNumber in range(numRows):
                oldVal = df.iloc[rowNumber, colNumber]
                newVal = round(oldVal / 2000.0, 2)
                df.iloc[rowNumber, colNumber] = newVal

    return df


def checkSownHarvestDates(aDf):
    """
    inputs: aDf -dataframe - has columns labeled "Date Sown" and "Date of Cut"
    output: outputs a dataframe with a column named "Harvested in Sown Year". This columns stores a 1.0 if the data point in that
            row has a cut date in the same year as its sown date
    """
    ### error checks
    # - confirms that the given dataframe has columns labeled 'Date Sown' and 'Date of Cut'
    try:
        sownDate = aDf.loc[0, "Date Sown"]
        cutDate = aDf.loc[0, "Date of Cut"]
    except ValueError:
        raise ValueError(
            "The input dataframe does not have columns labeled 'Date Sown' and 'Date of Cut'"
        )

    # loop through all of the rows of the dataframe
    for index, row in aDf.iterrows():
        # get sown and harvest dates
        sownDate = aDf.loc[index, "Date Sown"]
        cutDate = aDf.loc[index, "Date of Cut"]

        # convert the strings to date objects
        sownDate = datetime.datetime.strptime(sownDate, "%Y-%m-%d").date()
        cutDate = datetime.datetime.strptime(cutDate, "%Y-%m-%d").date()

        # get the years
        sownYear = int(sownDate.year)
        cutYear = int(cutDate.year)

        if sownYear == cutYear:
            aDf.loc[index, "Harvested in Sown Year"] = int(1)
        else:
            aDf.loc[index, "Harvested in Sown Year"] = int(0)

    return aDf


def checkFirstHarvest(aDf):
    """
    inputs: aDf - dataframe - has columns labeled "Date Sown" and "Date of Cut"
    output: outputs a dataframe with a column named "First Harvest of Season". This columns stores a 1.0 if the
            data point in that row was the first harvest of that year.
    """
    ### error checks
    # - confirms that the given dataframe has columns labeled 'Date Sown' and 'Date of Cut'
    try:
        sownDate = aDf.loc[0, "Date Sown"]
        cutDate = aDf.loc[0, "Date of Cut"]
    except ValueError:
        raise ValueError(
            "The input dataframe does not have columns labeled 'Date Sown' and 'Date of Cut'"
        )

    # initilalize a dictionary that will store the dates of each season. It will take the form of
    # {(State, City, Date Sown): {year of harvest1: [list of cuts in that year],
    #                             year of harvest2: [list of cuts in that year]...}
    #  (State, City, Date Sown)....}

    dateDict = {}

    # loop through all of the rows of the dataframe to fill dateDict
    for index, row in aDf.iterrows():
        # get variables
        state = aDf.loc[index, "State"]
        city = aDf.loc[index, "City"]
        sownDate = aDf.loc[index, "Date Sown"]

        cutDate = aDf.loc[index, "Date of Cut"]

        # convert the strings to date objects
        cutDate = datetime.datetime.strptime(cutDate, "%Y-%m-%d").date()

        # get the year
        cutYear = int(cutDate.year)

        # make the key for dataDict
        identifier = (state, city, sownDate)

        # if the key is not in dataDict, put it in
        if identifier not in dateDict:
            dateDict[identifier] = {}

        # if the cut year is not in dataDict[identifer], then put it in
        if cutYear not in dateDict[identifier]:
            dateDict[identifier][cutYear] = []

        # add the cut date to the list, if it is not already in there
        if cutDate not in dateDict[identifier][cutYear]:
            dateDict[identifier][cutYear].append(cutDate)

    # make dictionary that stores the first date of every harvest. It will be of the form:
    # {(State, City, Date Sown, Year of Harvest): first date of harvest}

    firstDateDict = {}
    for identifier in dateDict:
        for year in dateDict[identifier]:
            state = identifier[0]
            city = identifier[1]
            sownDate = identifier[2]

            # sort each list
            dateDict[identifier][year].sort()

            # get the first harvest
            firstHarvest = dateDict[identifier][year][0]

            # add entry to dictionary
            firstDateDict[(state, city, sownDate, year)] = firstHarvest

    # loop through every row of the dataframe and make the value of the column "First Harvest of Season"
    # a 1.0 if the cut date is the first harvest of the season, or a 0.0 if it is not.

    for index, row in aDf.iterrows():
        # get variables
        state = aDf.loc[index, "State"]
        city = aDf.loc[index, "City"]
        sownDate = aDf.loc[index, "Date Sown"]

        cutDate = aDf.loc[index, "Date of Cut"]

        # convert the strings to date objects
        cutDate = datetime.datetime.strptime(cutDate, "%Y-%m-%d").date()

        # get the year
        cutYear = int(cutDate.year)

        # make identifier (the key to firstDateDict)
        identifier = (state, city, sownDate, cutYear)

        # get the first date of the harvest
        firstDate = firstDateDict[identifier]

        # fill values of "First Harvest of Season"
        if firstDate == cutDate:
            aDf.loc[index, "First Date of Season"] = int(1)
        else:
            aDf.loc[index, "First Date of Season"] = int(0)

    # return result
    return aDf


##############################################################################################
# PLOT FUNCTIONS
##############################################################################################


def plotYield(aDataframe, cityName, sownDate=""):
    """
    inputs- aDataframe- dataframe obj - should have columns called "City", "Date of Cut", and "Yields (tons/acre)"
            cityName - string - the name of the city in which the crop yield data should be gathered from
            sownDate- string of the form '%Y-%m-d%' - the date of the sown date
    output - no output, but it does generate a graph showing the average yield of crops for a particular city

    NOTE: assumes that the package matplotlib as been imported
    """
    ## lets plot the average alfalfa yield over time (x-axis= datetime, y-axis= yield)

    if sownDate == "":
        cityDf = df.loc[aDataframe["City"] == cityName]

    else:
        cityDf = df.loc[
            (aDataframe["Date Sown"] == sownDate) & (aDataframe["City"] == cityName)
        ]

    # lets make a dictionary holding the values to be plotted. It will
    # be of the form: {date_of_Cut: avgYield of all varieties}

    plotDict = {}
    for index, row in cityDf.iterrows():
        doc = cityDf.loc[index, "Date of Cut"]
        if doc not in plotDict:
            plotDict[doc] = [
                0.0,
                0,
            ]  # this list is of the form [sumOfYield, numberOfVarietiesInSum]
        aYield = cityDf.loc[index, "Yield (tons/acre)"]
        plotDict[doc][0] += aYield
        plotDict[doc][1] += 1

    # make lists that will be used to make the plot
    xList = []
    yList = []
    for key in plotDict:
        # get x-value
        datetimeObj = datetime.datetime.strptime(key, "%Y-%m-%d")
        xList.append(datetimeObj)

        # get y-value
        aSum = plotDict[key][0]
        n = plotDict[key][1]
        avg = (aSum / n) * 1.0
        yList.append(avg)

    # plot settings
    dates = matplotlib.dates.date2num(xList)
    matplotlib.pyplot.plot_date(dates, yList)

    plt.gcf().autofmt_xdate()
    plt.show()


def plotAlfAndWeather(
    alfDf, wDf, city, sownDate, weather, athensReplacement="Watuga", show=True
):
    """
    inputs- alfDf - dataframe - dataframe storing alfalfa yield data. Must have columns labeled
                                "City", "Date Sown", "Date of Cut", and "Yield (tons/acre)"
          - wDf - dataframe - dataframe storing weather data. Must have colums labeled\
                              "City", "Date", and weather(this is the input variable)
          - city - string - string name of the city whose data will be plotted. The city must be in 
                            the "City" columns of alfDf and wDf
          -sownDate - string of the form year-month-day (XXXX-XX-XX) - the sown date of the data to be 
                      plotted. This must be in the "Date Sown" col of alfDf
          -weather - string - represents some type of data. Must be the same as a col name of wDf
          -athensReplacement - string - the GAEMN data does not have athens weather data, but it does
                                        have Watkinsville data. So this input must have a value in the
                                        col "City" of wDf. This data will be used as the athens data.
          -show - boolean - If 'True', then the final plot will be shown. Else, no plots will be shown.
    output- returns the final plot while also showing that plot if show=True.
    
    NOTE: The average yield of all alfalfa varieties at each cut is being graphed. It is assumed that there is a df with
    the variety yield data ('alfDf') and a different dataframe has the daily weather data ('wDf')
    """
    # imports
    import matplotlib.pyplot as plt

    ## make sub dataframes
    # alfalfa
    cityAlfDf = alfDf.loc[(alfDf["City"] == city) & (alfDf["Date Sown"] == sownDate)]

    # weather
    # check to see if city="Athens" (there is not GAEMN data for athens, but there is for Watkinsville)
    if city == "Athens":
        cityWDf = wDf.loc[(wDf["City"] == athensReplacement)]
    else:
        cityWDf = wDf.loc[(wDf["City"] == city)]

    ## make lists of alfalfa data- make list of dates and list of crop yields

    # lets make a dictionary holding the values to be plotted. It will
    # be of the form: {date_of_Cut: avgYield of all varieties}. This will
    # be used to store the average yield of all alfalfa varieties.

    plotDict = {}
    for index, row in cityAlfDf.iterrows():
        doc = cityAlfDf.loc[index, "Date of Cut"]
        if doc not in plotDict:
            plotDict[doc] = [
                0.0,
                0,
            ]  # this list is of the form [sumOfYield, numberOfVarietiesInSum]
        aYield = cityAlfDf.loc[index, "Yield (tons/acre)"]
        plotDict[doc][0] += aYield
        plotDict[doc][1] += 1

    ## make lists that will be used to make the plot
    xListAlf = []
    yListAlf = []
    for key in plotDict:
        # get x-value
        datetimeObj = datetime.datetime.strptime(key, "%Y-%m-%d")
        xListAlf.append(datetimeObj)

        # get y-value
        aSum = plotDict[key][0]
        n = plotDict[key][1]
        avg = (aSum / n) * 1.0
        yListAlf.append(avg)

        # normalize all the values in yListAlf
        maxValue = max(yListAlf)
        yListAlf = [float(i) / maxValue for i in yListAlf]

    # make lists of weather data- make list of dates and weather info
    xListW = []
    yListW = []
    for index, row in cityWDf.iterrows():
        # get x-value
        datePoint = cityWDf.loc[index, "Date"]
        datePoint = datetime.datetime.strptime(datePoint, "%Y-%m-%d")
        # get y-value
        weatherPoint = cityWDf.loc[index, weather]

        # fill lists
        xListW.append(datePoint)
        yListW.append(weatherPoint)

    # normalize all the values in yListW
    maxValue = max(yListW)
    yListW = [float(i) / maxValue for i in yListW]

    ## make the plot
    fig = plt.figure()
    plt.plot(xListW, yListW, color="b", label=weather, linewidth=0.5)
    plt.plot(
        xListAlf,
        yListAlf,
        color="r",
        label="Crop Yield (tons/acre)",
        linestyle="--",
        marker="o",
    )

    ## plot settings
    # make title
    index = weather.find("(")
    weatherString = weather[:index]
    title = "Yield and " + weatherString + " for " + city + ", sown at " + str(sownDate)
    plt.title(title)
    # make a legend and place it below the picture
    plt.legend(loc="upper center", bbox_to_anchor=(0.5, -0.2), shadow=True, ncol=2)
    plt.xticks(rotation=45)

    # show plot
    if show:
        plt.show()
    return fig


def makeAlfWeatherPDFDaily(
    saveLocation,
    citySownList,
    weatherList,
    alfDf,
    wDf,
    athensReplacement="Watuga",
    show=True,
):
    """
    inputs- saveLocation - raw string - directory location where the pdf will be saved.
          - citySownList - list of tuples of the form (String1, String2) - where String1 is a city
                           in the "City" col of alfDf and wDf and String 2 is the sown date
                           (year-month-day XXXX-XX-XX) in the "Date Sown" col of alfDf.
          - weatherList - list of strings - where each string is a col name in wDf
          - alfDf - dataframe - dataframe storing alfalfa yield data. Must have columns labeled
                                "City", "Date Sown", "Date of Cut", and "Yield (tons/acre)"
          - wDf - dataframe - dataframe storing weather data. Must have colums labeled
                              "City", "Date", and weather(this is the input variable)
          -athensReplacement - string - the GAEMN data does not have athens weather data, but it does
                                        have Watkinsville data. So this input must have a value in the
                                        col "City" of wDf. This data will be used as the athens data.
          -show - boolean - If 'True', then the final plot will be shown. Else, no plots will be shown.
    outputs- no output, but will save a pdf of all of the plots that are made

    NOTE: It is also assumed that there is a df with the variety yield data ('alfDf') and a different dataframe
    has the daily weather data ('wDf')
    """
    # import pdf stuff
    from matplotlib.backends.backend_pdf import PdfPages

    # make plots and save them
    pdf = matplotlib.backends.backend_pdf.PdfPages(saveLocation)
    for city, sownDate in citySownList:
        for weather in weatherList:
            fig = plotAlfAndWeather(
                alfDf, wDf, city, sownDate, weather, athensReplacement, show
            )
            pdf.savefig(fig, bbox_inches="tight")
    pdf.close()


def plotYieldAndWeather(aDf, city, sownDate, weatherVar, show=True):
    """
    inputs - aDf - dataframe - must have columns labeled "Date of Cut", "City", "Date Sown", and "Variety"
           - city - string - the name of the city whose data should be plotted
           - sownDate - string - the date in which the crop whose yield should be plotted is sown
           - weatherVar - string - the name of the column in "aDf" whose data will be graphed along with the yield
           - show - boolean - if True, the the plot is shown, else the plot is not shown
    output - a matplotlib figure of the crop yield and the weather data

    NOTE: This function should be used with the aggregate data being loaded in as 'aDf'. So both the alfalfa yield data,
    the weather data, and the aggregatted weather data should all be in this table.
    """
    import matplotlib.pyplot as plt

    # make a sub dataframe that only contains the relevant information
    subDf = aDf.loc[(aDf["City"] == city) & (aDf["Date Sown"] == sownDate)]

    # lets make a dictionary holding the values to be plotted. It will
    # be of the form: {date_of_Cut: [sumOfYield, numberOfVarietiesInSum, weatherVal]}

    plotDict = {}
    for index, row in subDf.iterrows():
        doc = subDf.loc[index, "Date of Cut"]
        if doc not in plotDict:
            weatherVal = subDf.loc[index, weatherVar]
            plotDict[doc] = [
                0.0,
                0,
                weatherVal,
            ]  # this list is of the form [sumOfYield, numberOfVarietiesInSum, weatherVal]
        aYield = subDf.loc[index, "Yield (tons/acre)"]
        plotDict[doc][0] += aYield
        plotDict[doc][1] += 1

    ## make lists that will be used to make the plot
    xVals = []
    yValsYield = []
    yValsW = []
    for key in plotDict:
        # get x-value
        datetimeObj = datetime.datetime.strptime(key, "%Y-%m-%d")
        xVals.append(datetimeObj)

        # get yield y-value
        aSum = plotDict[key][0]
        n = plotDict[key][1]
        avg = (aSum / n) * 1.0
        yValsYield.append(avg)

        # get weather y-values
        weatherVal = plotDict[key][2]
        yValsW.append(weatherVal)

    # get pearson correlation coefficient
    corr = np.corrcoef(yValsYield, yValsW)[0, 1]

    # normalize all the values in yValsYield
    minValue = min(yValsYield)
    maxValue = max(yValsYield)
    yValsYield = [((float(i) - minValue) / (maxValue - minValue)) for i in yValsYield]

    # normalize all the values in yValsW
    minValue = min(yValsW)
    maxValue = max(yValsW)
    yValsW = [((float(i) - minValue) / (maxValue - minValue)) for i in yValsW]

    ## make the plot
    fig = plt.figure()
    plt.plot(
        xVals,
        yValsYield,
        color="r",
        label="Crop Yield (tons/acre)",
        linestyle="--",
        marker="o",
    )
    plt.plot(xVals, yValsW, color="b", label=weatherVar, linestyle="--", marker="o")
    # make an empty plot so i can have the correlation value
    plt.plot([], [], " ", label="R = " + str(corr))

    ## plot settings
    # make title
    index = weatherVar.find("(")
    weatherString = weatherVar[:index]
    title = "Yield and " + weatherString + " for " + city + ", sown at " + str(sownDate)
    plt.title(title)

    # make a legend and place it below the picture
    plt.legend(loc="upper center", bbox_to_anchor=(0.5, -0.2), shadow=True, ncol=2)
    plt.xticks(rotation=30)

    if show:
        # show the plot
        plt.show()

    return fig


def makeYieldWeatherPDFAggregate(
    saveLocation, citySownList, weatherList, aDf, show=True
):
    """
    inputs- saveLocation - raw string - directory location where the pdf will be saved.
          - citySownList - list of tuples of the form (String1, String2) - where String1 is a city
                           in the "City" col of alfDf and wDf and String 2 is the sown date
                           (year-month-day XXXX-XX-XX) in the "Date Sown" col of alfDf.
          - weatherList - list of strings - where each string is a col name in wDf
          - aDf - dataframe - must have columns labeled "Date of Cut", "City", "Date Sown", and "Variety"
          - show - boolean - If 'True', then the final plot will be shown. Else, no plots will be shown.
    outputs- no output, but will save a pdf of all of the plots that are made

    NOTE: This function should be used with the aggregate data being loaded in as 'aDf'. So both the alfalfa yield data,
    the weather data, and the aggregatted weather data should all be in this table.
    """
    # import matplotlib and pdf stuff
    import matplotlib
    from matplotlib.backends.backend_pdf import PdfPages

    # make plots and save them
    pdf = matplotlib.backends.backend_pdf.PdfPages(saveLocation)
    for city, sownDate in citySownList:
        for weatherVar in weatherList:
            fig = plotYieldAndWeather(aDf, city, sownDate, weatherVar, show=True)
            pdf.savefig(fig, bbox_inches="tight")
    pdf.close()


#########################################################################################################################
# DATE FUNCTIONS
#########################################################################################################################


def dateStringToJulianDay(dateString):
    """
    inputs- dateString - string of the form "YEAR-MONTH-DAY" (XXXX-XX-XX) - a string representing a date that will be
                         converted to a Julian date (int ranging from 0 and 365).
    output- an integer representing the number of days since the January 1st of that year.
    """
    ### error checks- checks that the input has the correct format
    if not (isinstance(dateString, str)):
        raise ValueError("The input is not a string; the input should be a string")

    try:
        datetimeObj = datetime.datetime.strptime(dateString, "%Y-%m-%d")
    except ValueError:
        raise ValueError(
            "The input has an incorrect data format; it should be YYYY-MM-DD"
        )

    # convert the dateString to a date object
    datetimeObj = datetime.datetime.strptime(dateString, "%Y-%m-%d").date()

    # get the year
    year = int(datetimeObj.year)

    # find the amount of days that has passed since Jan 1st of that year
    d0 = datetime.date(year, 1, 1)
    delta = datetimeObj - d0
    julianDay = delta.days + 1

    # return result
    return julianDay


def interpolatePercentCover(
    percentDatePrev, percentDateAfter, percentCoverPrev, percentCoverAfter, cutDate
):
    """
    inputs: percentDatePrev - date obj - date prior to cut date that recorded the percent cover
            percentDateAfter - date obj - date after the cut date that recorded the percent cover
            percentCoverPrev - float - percent cover measured on percentDatePrev
            percentCoverAfter - float - percent cover measured on percentDateAfter
            cutDate - date obj - the date a variety was cut and its yield was measured.
    output: float between 0.0 and 1.0 representing the estimated percent cover on
    """
    # find the amount days between the times the percent cover was measured
    daysBetweenCoverMeasurements = percentDateAfter - percentDatePrev

    # find the amount of days between the cut date and the date after it where the percent cover was measured
    daysBetweenCutDateAndCoverMeasurement = percentDateAfter - cutDate

    # get the ratio
    ratio = (1.0 * daysBetweenCutDateAndCoverMeasurement) / (
        daysBetweenCoverMeasurements
    )

    # get the percent cover on the cutDate
    cutPercentCover = (-1.0) * (
        ratio * (percentCoverAfter - percentCoverPrev) - percentCoverAfter
    )

    # return result
    return cutPercentCover


###############################################################################################
# Machine Learning Stuff
###############################################################################################
def makeTrainTestData(xDf, yDf, testSize=0.2, trainSize=None, randomSeed=None):
    """
    inputs: xDf - dataframe - where each column contains values to be used to make machine learning model
            yDf - dataframe - with a single column, such that the column contains values that should be the
                              expected result from a machine learning model when given the corresponding inputs from
                              'xDf'.
            testSize - float ranging from 0.0 to 1.0, or an int - If a float, this represents the percentage of the data that
                       should be in a testing set. If an int, then this represents the absolute number of data points that
                       should be included in the testing sets.
            trainSize - float ranging from 0.0 to 1.0, or an int - If a float, this represents the percentage of the data that
                        should be in a training set. If an int, then this represents the absolute number of data points that
                        should be included in the training sets.
            randomSeed - int - The seed that will decide how the data will be randomized before making the training/testing sets.

    outputs: xTrain - numpy array -  contains all of the training data. Used for training models.
             yTrain - list - has all of the ground truth outputs. This corresponds to xTrain. Used for training models.
             xTest - numpy array - contains all of the testing data. Used for testing models.
             yTest - list - has all of the ground truth outputs. This corresponds to xTest. Used for testing models.

    NOTE: It is assumed that every value within one column has the same data type. There should be no instances in either input
          Dataframe where there is no value in a row.
    NOTE: The value in the first row of 'outputDataframe' is the true value that corresponds to the inputs from the first row
          of the 'inputDataframe'. This is the case for all rows.
    """
    # make the first input to train_test_split
    X = xDf.values
    # make the second input to train_test_split
    columnName = yDf.columns[0]
    y = []

    for i in range(len(yDf.index)):  # loop through every row of the dataframe
        y.append(yDf.iloc[i, 0])

    # use sklearn's train test split
    x_train, x_test, y_train, y_test = train_test_split(
        X, y, test_size=testSize, train_size=trainSize, random_state=randomSeed
    )
    return x_train, x_test, y_train, y_test


def getBestModel(N, xDf, yDf, emptyModel, paramGrid, features, metricToOptimize="r2"):
    """
    inputs: N - int - the number of times the model should be trained and evaluated.
            xDf - pandas dataframe - the rows represent the data points, the columns represent the features. These
                                         are the inputs into the model
            yDf - pandas dataframe - the rows represent the data points, there is only one column. This contains the
                                         the target values for the model.
            emptyModel - sklearn model - a valid sci-kit learn model with a 'fit' method.
            paramGrid - dictionary - the para_grid to be used with this model in a grid search. Note that each parameter name
                                     in the grid must start with 'model__' (two underscores).
            features - int or float - if int, then use SelectKBest where k='features'. If float, use SelectPercentile
                                      where 'features' is the percentage
            testSize - float - the percentage of the data that should be used for the testing set (if method=='split')
            metricToOptimize - string - either 'mae' or 'r2'.
    outputs: avgMAE - the average mean absolute error of the model as it is evaluated N times.
             avgRSq - the average R^2 value of the model as it is evaluated N times.
             bestMAE - the mean absolute error of the best model out of the N iterations.
             bestRSq - the R^2 of the best model out of the N iterations.
             bestModel - the trained best model out of the N iterations.

    NOTE: This assumes the data in xDf has been standardized or normalized before being used in this function.
    """
    # initialize the outputs
    avgMAE = 0.0
    avgRSq = 0.0
    bestRSq = -9999999999.99
    bestMAE = 9999999999.99

    # get the input features in the correct format
    X = xDf.values
    # put the target values in the correct format
    columnName = yDf.columns[0]
    y = []

    for i in range(len(yDf.index)):  # loop through every row of the dataframe
        y.append(yDf.iloc[i, 0])

    # convert the list to a numpy array
    y = np.asarray(y)

    # make the cv settings
    cv = KFold(n_splits=N, random_state=42, shuffle=True)

    # for every fold
    for train_index, test_index in cv.split(X):
        # for train_index, test_index in zip(X[:224], X[224:]):

        # standardization
        standardScaler = preprocessing.StandardScaler()

        # feature selection
        if type(features) == int:
            featureSelection = SelectKBest(f_regression, k=features)
        elif type(features) == float:
            featuresPercentile = features / 100.0
            featureSelection = SelectPercentile(
                f_regression, percentile=featuresPercentile
            )
        else:
            raise ValueError(
                "The input 'features' is not an integer or a float. It should be."
            )

        # make a pipeline
        pipe = Pipeline(
            steps=[
                ("standardization", standardScaler),
                ("feature selection", featureSelection),
                ("model", emptyModel),
            ]
        )

        # get the train and test data
        xTrain, xTest, yTrain, yTest = (
            X[train_index],
            X[test_index],
            y[train_index],
            y[test_index],
        )

        # do a grid search and K-fold cross validation
        numFolds = 5  # 5-Fold cross validation

        # make the model with optimized hyperparameters via a grid search with cross validation
        #         model = GridSearchCV(
        #             estimator=pipe,
        #             param_grid=paramGrid,
        #             cv=KFold(n_splits=numFolds, shuffle=True),
        #             scoring='neg_mean_absolute_error',
        #             return_train_score=False
        #         )

        model = xgb.XGBRegressor()

        # fit model
        model.fit(xTrain, yTrain)
        # xgb_model.fit(xTrain, yTrain)

        # get predictions
        pred = model.predict(xTest)
        trainPred = model.predict(xTrain)
        #         xgb_pred = xgb_model.predict(xTest)
        #         xgb_trainPred = xgb_model.predict(xTrain)

        # find errors
        meanAbsoluteError = mean_absolute_error(yTest, pred)
        trainMeanAbsoluteError = mean_absolute_error(yTrain, trainPred)

        # find the R^2 values
        rSq = r2_score(yTest, pred)
        trainRSq = r2_score(yTrain, trainPred)

        # calculate accuracy
        # accuracy = accuracy_score(yTest, pred)

        # calculate f1 score
        # f1 = f1_score(yTest, pred, average='macro')

        # calculate matthews correlation coefficient
        # mcc = matthews_corrcoef(yTest, pred)

        # add the errors and R Squared to average values
        avgMAE += meanAbsoluteError
        avgRSq += rSq

        # check to see which metric should be optimized
        if metricToOptimize == "r2":
            # check to see if any of these are the best values
            if rSq > bestRSq:
                bestMAE = meanAbsoluteError
                bestModel = model
                bestRSq = rSq

        elif metricToOptimize == "mae":
            # check to see if any of these are the best values
            if meanAbsoluteError < bestMAE:
                bestMAE = meanAbsoluteError
                bestModel = model
                bestRSq = rSq

        else:
            raise ValueError(
                "The input 'metricToOptimize' does not have a valid input. It must be 'r2' or 'mae'."
            )

    # divide the sums by N to get the averages
    avgMAE /= N
    avgRSq /= N

    ## get the features that were selected to train the best model

    # get all of the feature names and store in a numpy array
    features = np.asarray(list(xDf))

    # get a boolean list to say which features were kept
    # boolArray = bestModel.best_estimator_.named_steps['feature selection'].get_support()

    # get a list of which features were kept
    # featuresUsed = np.ndarray.tolist(features[boolArray])

    ## return the results
    return avgMAE, avgRSq, bestMAE, bestRSq, bestModel  # , featuresUsed


def saveMLResults(
    all_yearsDf,
    final_yearDf,
    target_yearDf,
    boost_xDf,
    boost_yDf,
    xTest,
    yTest,
    N,
    xDf,
    yDf,
    modelList,
    workingDir,
    numFeatures,
    printResults=True,
):
    """
    inputs: N - int - the number of times the model should be trained and evaluated.
            xDf - pandas dataframe - the rows represent the data points, the columns represent the features. These
                                         are the inputs into the model
            yDf - pandas dataframe - the rows represent the data points, there is only one column. This contains the
                                         the target values for the model.
            modelList - list of tuples - each tuple takes the form of
                        (empty sklearn model, parameter grid for sklearn's gridsearchcv, name of file to be saved).
                        The parameter grid should be a dictionary of possible parameter values for the empty model.
                        Look at sklearn's documentation for more information
           workingDir - string - the directory where the final results should be saved
           numFeatures - int or float - if int, then use SelectKBest where k='features'. If float, use SelectPercentile
                                      where 'features' is the percentage
           printResults - boolean - if True, then also print the results. Otherwise, dont print the results
    outputs: nothing is returned, but the results are saved at the given location. A tuple is saved of the form
             (bestModel, bestFeatures, bestMAE, bestRSq, avgMAE, avgRSq). Each value means the following
             -bestModel - the best model found by 'getBestModel'. Note that this is the trained sklearn model itself
             -bestFeatures - the chosen features for the best model
             -bestMAE - the mean absolute error of the best model
             -bestRSq - the R squared value of the best model
             -avgMAE - the average mean absolute error of the model over the N iterations
             -avgRSq- the average R squared value of the model over the N iterations
    """
    # for every entry in the list
    for tup in modelList:
        model = tup[0]
        paramGrid = tup[1]
        filename = tup[2]

        # get results
        #         avgMAE, avgRSq, bestMAE, bestRSq, bestModel, bestFeatures = getBestModel(N, xDf, yDf, model, paramGrid,
        avgMAE, avgRSq, bestMAE, bestRSq, bestModel = getBestModel(
            N, xDf, yDf, model, paramGrid, features=numFeatures, metricToOptimize="r2"
        )

        # convert tons to lbs to make results more readable
        avgMAE = round(avgMAE * 2000, 3)
        bestMAE = round(bestMAE * 2000, 3)

        # get the save location
        saveLoc = workingDir + "/" + filename

        # get model name
        stopIndex = filename.find(".")
        modelName = filename[:stopIndex]

        # save the new model over the old model if the new model has a better R^2 value
        #         joblib.dump((bestModel, bestFeatures, bestMAE, bestRSq, avgMAE, avgRSq), saveLoc)
        joblib.dump((bestModel, bestMAE, bestRSq, avgMAE, avgRSq), saveLoc)

        # if 'printResults' is True, then print results
        if printResults:
            print("model: ", modelName)
            print("Avg MAE: ", avgMAE)
            print("Avg R squared: ", round(avgRSq, 3))
            print("Best MAE: ", bestMAE)
            print("Best R squared: ", round(bestRSq, 3))
            # print("Parameters of the best model: ", bestModel.best_params_)
            # print("Features selected by best model: ", bestFeatures)
            print(" ")

        m, r = actualTest(
            all_yearsDf,
            final_yearDf,
            target_yearDf,
            boost_xDf,
            boost_yDf,
            xTest,
            yTest,
            bestModel,
        )

        print("non-local results:")
        print("MAE: ", m)
        print("R: ", r)

        # count += 1


def actualTest(
    all_yearsDf, final_yearDf, target_yearDf, boost_xDf, boost_yDf, xTest, yTest, model
):
    model = model.fit(boost_xDf, boost_yDf)
    # get predictions
    pred = model.predict(xTest)

    adj_pred = []
    for i in range(len(pred)):
        adj_pred.append(final_yearDf["yield"][i] + pred[i])

    adj_pred_Df = pd.DataFrame(adj_pred)

    # find errors
    meanAbsoluteError = mean_absolute_error(target_yearDf["yield"], adj_pred_Df)

    pred_ts = []
    len_tsDf = len(all_yearsDf)
    for i in range(len_tsDf - len(adj_pred), len_tsDf):
        pred_ts.append(i)

    pred_df = pd.DataFrame(adj_pred, index=pred_ts, columns=["yield"])

    # find the R values
    r = np.corrcoef(target_yearDf["yield"], adj_pred)[0, 1]

    # find the R^2 coefficient of determination
    r2pred = sm.add_constant(adj_pred)
    yTargetYield = target_yearDf["yield"]
    result = sm.OLS(yTargetYield, r2pred).fit()

    mape = round(skt_mape(yTargetYield, adj_pred_Df) * 100, 3)
    smape = round(skt_smape(yTargetYield, adj_pred_Df) * 100, 3)
    mae = round(skt_mae(yTargetYield, adj_pred_Df), 3)
    mse = round(skt_mse(yTargetYield, adj_pred_Df), 3)
    rmse = round(math.sqrt(skt_mse(yTargetYield, adj_pred_Df)), 3)

    # Reset index for all_yearsDf and adjust index values
    all_yearsDf.reset_index(drop=True, inplace=True)
    all_yearsDf.index -= 1

    # Increment prediction timestamps by 1
    pred_ts = [ts + 1 for ts in pred_ts]

    # Return all the metrics along with adj_pred, adj_pred_df, and pred_ts
    return (
        adj_pred,
        meanAbsoluteError,
        r,
        mape,
        smape,
        mae,
        mse,
        rmse,
        adj_pred_Df,
        pred_ts,
        all_yearsDf,
    )


#     avgRSq += rSq

#     # check to see which metric should be optimized
#     if metricToOptimize == 'r2':
#         # check to see if any of these are the best values
#         if (rSq > bestRSq):
#             bestMAE = meanAbsoluteError
#             bestModel = model
#             bestRSq = rSq

#     elif metricToOptimize == 'mae':
#         # check to see if any of these are the best values
#         if (meanAbsoluteError < bestMAE):
#             bestMAE = meanAbsoluteError
#             bestModel = model
#             bestRSq = rSq

#     else:
#         raise ValueError("The input 'metricToOptimize' does not have a valid input. It must be 'r2' or 'mae'.")
